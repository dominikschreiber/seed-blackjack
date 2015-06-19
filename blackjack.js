'use strict';

angular.module('blackjack', [
    'blackjack.cardsService',
    'blackjack.cardDirective',
    'blackjack.handDirective',
    'ng'
])

.controller('BlackjackController', function($q, $log, $scope, $timeout, cards) {
    $scope.players = [];

    // "no hole card" -- dealer gets second card after players hands are played
    cards.draw().then(function(card) {
        $scope.dealer = { 
            is: 'dealer',
            hand: [card],
            // dealer has to draw cards until his hand is 17 or higher
            play: function() {
                if (optimalScore($scope.dealer.hand) < 17) {
                    cards.draw().then(function(card) {
                        handleDrawnCard($scope.dealer, card);

                        if (optimalScore($scope.dealer.hand) < 17) {
                            $timeout(function() { $scope.dealer.play(); }, 1000);
                        }
                    });
                }
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
        $scope.dealer.play();

        var validScorers = _.chain($scope.players)
                            .filter(function(player) { return minimalScore(player.hand) < 22; })
                            .groupBy(function(player) { return optimalScore(player.hand) })
                            .pairs()
                            .max(function(pair) { return pair[0]; })
                            .tap(function(i) { $log.log(JSON.stringify(i)) })
                            .value();

        $timeout(function() {
            $scope.winner = undefined;
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
        }, 3000);
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
    function optimalScore(hand) {
        function isAce(card) { return card.value === 'A'; }
        var minimal = minimalScore(hand);

        return minimalScore(hand) + Math.min(_.filter(hand, isAce).length, Math.floor(21 - minimal / 10)) * 10;
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