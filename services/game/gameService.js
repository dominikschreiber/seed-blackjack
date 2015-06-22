'use strict';

angular.module('blackjack.gameService', [
    'blackjack.handService',
    'blackjack.cardsService',
    'blackjack.strategyService',
    'ng'
])

.service('game', function($q, $log, $rootScope, $timeout, strategy, hand, cards) {
    var players = []
      , currentPlayerIndex = 0;

    /**
     * plays the turn of the current player until his strategy.move() resolves
     * with strategy.STICK or his hand.score() exceeds (including) 21.
     *
     * @return a promise to resolve with the result of a single turn of the current player
     */
    function playTurn(resolve, reject) {
        function turn(res, rej) {
            var player;

            if (players.length < currentPlayerIndex + 1) {
                rej(currentPlayerIndex + ' not a registered player. Use game.addPlayer(Player) to register a player.');
            } else {
                player = players[currentPlayerIndex];
                if (player.hand.score() < 21) {
                    player.strategy.move(player.hand).then(function(result) {
                        if (result !== strategy.STICK) {
                            cards.draw().then(function(card) {
                                player.hand.cards.push(card);
                                playTurn(res, rej);
                            });
                        } else {
                            res(player);
                        }
                    });
                } else {
                    res(player);
                }
            }
        }

        if (resolve === undefined && reject === undefined) {
            // first call to playTurn(), need new promise methods
            return $q(function(resolve, reject) {
                turn(resolve, reject);
            });
        } else {
            // using existing resolve/reject to end original promise
            return $q(function() {
                turn(resolve, reject);
            });
        }
    }

    function endRound() {
        return $q(function(resolve, reject) {
            if (players.length < currentPlayerIndex + 1) {
                reject('No player added. Use game.addPlayer(Player) to add a player.');
            } else {
                getValidScorers().then(function(scorers) {
                    if (scorers.length === 0) {
                        reject('no valid score!');
                    } else if (scorers.length === 1) {
                        resolve({type: 'win', of: scorers[0]});
                    } else {
                        resolve({type: 'split', of: scorers});
                    }
                });
            }
        });
    }

    function getValidScorers() {
        return $q(function(resolve) {
            var validHands = _.filter(players, function(player) { return player.hand.score() < 22; })
              , scoreGroups = _.groupBy(validHands, function(player) { return player.hand.score(); })
              , highestGroup = _.max(_.pairs(scoreGroups), function(pair) { return pair[0]; })
              , highestScorers = highestGroup[1];

            resolve(highestScorers || []);
        });
    }

    function playRound(resolve, reject) {
        function round(res, rej) {
            playTurn().then(function(player) {
                getValidScorers().then(function(scorers) {
                    $log.log(currentPlayerIndex, players.length, scorers.map(function(p) { return p.is + ':' + p.hand.score() }));
                    if (// only dealer left and only valid score is dealers hand => skip dealer, he wins!
                        currentPlayerIndex < players.length - 1 && scorers.length === 1 ||
                        // all players already played
                        currentPlayerIndex >= players.length - 1) {
                        endRound().then(function(result) {
                            $rootScope.$emit('game::round::end', result);
                            $timeout(function() { res(); }, 3 * 1000);
                        });
                    } else {
                        currentPlayerIndex += 1;
                        $rootScope.$emit('game::turn::end', player);
                        playRound(res, rej);
                    }
                });
            });
        }

        // see #playTurn
        if (resolve === undefined && reject === undefined) {
            return $q(function(resolve, reject) {
                round(resolve, reject);
            });
        } else {
            return $q(function() {
                round(resolve, reject);
            });
        }
    }

    /**
     * deals a new hand to all registered players,
     * where each player gets two unique cards and
     * the dealer only gets one (playing )
     */
    function deal() {
        return $q(function(resolve, reject) {
            currentPlayerIndex = 0;
            $q.all(_.map(players, function(player) {
                return $q(function(resolve, reject) {
                    if (player.is === 'dealer') {
                        cards.draw().then(function(card) {
                            player.hand = hand([card]);
                            resolve();
                        })
                    } else {
                        $q.all([cards.draw(), cards.draw()]).then(function(cards) {
                            player.hand = hand(cards);
                            resolve();
                        });
                    }
                });
            })).then(function() {
                resolve();
            });
        });
    }

    /** runs the whole game (i.e. an infinite sequence of rounds) */
    function playGame() {
        deal().then(function() {
            if (players.length > 1) {
                playRound().then(function() {
                    playGame();
                }, $log.warn);
            } else {
                $log.warn('only one player, nothing to do!');
            }
        });
    }

    return {
        addPlayer: function(player) {
            return $q(function(resolve) {
                players.push(angular.extend(player, { hand: hand([]) }));
                players.sort(function(player) { return player.is === 'dealer' ? 1 : 0 });
                resolve(players);   
            });
        },

        getPlayers: function() {
            return $q(function(resolve) {
                resolve(players);
            });
        },

        run: playGame
    };
});