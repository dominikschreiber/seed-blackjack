'use strict';

angular.module('blackjack', [
    'blackjack.cardsService',
    'blackjack.cardDirective',
    'blackjack.handDirective',
    'ng'
])

.controller('BlackjackController', function($q, $scope, $timeout, cards) {
    $scope.players = [];

    // "no hole card" -- dealer gets second card after players hands are played
    cards.draw().then(function(card) {
        $scope.dealer = { 
            is: 'dealer',
            hand: [card],
            // dealer has to draw cards until his hand is 17 or higher
            play: function() {
                return $q(function(resolve) {
                    function drawCard(resolve) {
                        cards.draw().then(function(card) {
                            handleDrawnCard($scope.dealer, card);
                            if ($scope.optimalScore($scope.dealer.hand) < 17) {
                                $timeout(function() { drawCard(resolve); }, 1000);
                            } else {
                                resolve();
                            }
                        });
                    }

                    if ($scope.optimalScore($scope.dealer.hand) < 17) {
                        drawCard(resolve);
                    } else {
                        resolve();
                    }
                });
            }            
        };
        $scope.players.push($scope.dealer);
    });

    $scope.join = function() {
        $q.all([cards.draw(), cards.draw()]).then(function(hand) {
            $scope.player = {
                is: 'human',
                hand: hand,
                canDrawMoreCards: true
            };
            $scope.players.push($scope.player);
        });
    };

    $scope.hit = function() {
        cards.draw().then(function(card) {
            handleDrawnCard($scope.player, card);
        });
    };

    $scope.stick = function() {
        endRound();
    };

    /** sets the specified player to a new game state */
    function resetPlayer(player, hand) {
        player.hand = hand;
        player.canDrawMoreCards = true;
    }

    /** ends the round by determining the winner and dealing new cards */
    function endRound() {
        function hasValidScore(player) { return minimalScore(player.hand) < 22; }

        function finalizeRound() {
            var validScorers = _.chain($scope.players)
                                .filter(hasValidScore)
                                .groupBy(function(player) { return $scope.optimalScore(player.hand) })
                                .pairs()
                                .max(function(pair) { return pair[0]; })
                                .value()[1]; // [1] removes groupBy value

            if (validScorers.length > 1) {
                $scope.result = {type: 'split', of: validScorers};
            } else if (validScorers.length === 1) {
                $scope.result = {type: 'win', of: validScorers[0]};
            }

            $timeout(function() {
                $scope.result = undefined;
                _.each($scope.players, function(player) {
                    if (player.is === 'dealer') {
                        cards.draw().then(function(card) {
                            player.hand = [card];
                        });
                    } else {
                        $q.all([cards.draw(), cards.draw()]).then(function(hand) {
                            resetPlayer(player, hand);
                        });
                    }
                });
            }, 5000);
        }

        if (_.chain($scope.players)
             .reject(function(player) { return player.is === 'dealer' })
             .filter(hasValidScore)
             .value()
             .length > 0) {
            $scope.dealer.play().then(finalizeRound);
        } else {
            finalizeRound();
        }
    }

    /**
     * 1. adds card to players hand
     * 2. determines if player is allowed to draw another card
     * 3. ends the round if score exceeds limit
     */
    function handleDrawnCard(player, card) {
        var minimal;

        player.hand.push(card);
        minimal = minimalScore(player.hand);
        player.canDrawMoreCards = minimal < 22;

        if (minimal > 21) {
            endRound();
        }
    }

    /** @return the minimal score for a given hand, i.e. counting aces as 1 */
    function minimalScore(hand) {
        return _.chain(hand)
                .map(toScore)
                .sum()
                .value();
    }

    /** @return the optimal score for a given hand, i.e. counting aces as 11 or 1 as fits best */
    $scope.optimalScore = function(hand) {
        function isAce(card) { return card.value === 'A'; }
        var minimal = minimalScore(hand);

        if (minimal > 20) return minimal;
        else return minimalScore(hand) + Math.min(_.filter(hand, isAce).length, Math.floor((21 - minimal) / 10)) * 10;
    }

    /** @return the score of a single card, counting aces as 1  */
    function toScore(card) {
        switch (card.value) {
            case 'A': return 1;
            case 'B': case 'D': case 'K': return 10;
            default: return parseInt(card.value);
        }
    }
});