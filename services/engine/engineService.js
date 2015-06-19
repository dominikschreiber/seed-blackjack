'use strict';

angular.module('blackjack.engineService', ['blackjack.cardsService', 'ng'])

.service('engine', function($log, $q, cards) {
    var players = {}
      , engine = {
            /** @return a promise to resolve with the id of the newly created player */
            addPlayer: function(id) {
                return $q(function(resolve) {
                    id = id || _.random(999);
                    $q.all([cards.draw(), cards.draw()]).then(function(hand) {
                        players[id] = {
                            hand: hand
                        };
                        resolve(id);
                    });
                });
            },

            /** @return a promise to resolve with the ids of all players */
            getPlayers: function() {
                return $q(function(resolve) {
                    return _.keys(players);
                });
            },

            /** @return a promise to resolve with the minimal score player `id` has (i.e. treating all 'A' as 1, not 11) */
            getMinimalScoreForPlayer: function(id) {
                return $q(function(resolve) {
                    resolve(_.chain(players[id].hand)
                             .map(function(card) {
                                switch (card.value) {
                                    case 'A': return 1;
                                    case 'B': case 'D': case 'K': return 10;
                                    default: return window.parseInt(card.value);
                                }
                             })
                             .sum()
                             .value());
                });
            },

            /** @return a promise to resolve with a drawn card for player `id` */
            drawCardForPlayer: function(id) {
                return $q(function(resolve, reject) {
                    var card;

                    if (!id in players) {
                        reject('player ' + id + ' not in ' + _.keys(players));
                    } else {
                        cards.draw().then(function(card) {
                            players[id].hand.push(card);
                            engine.getMinimalScoreForPlayer(id).then(function(score) {
                                resolve({
                                    card: card,
                                    canDrawMoreCards: score < 21,
                                    isValid: score < 22
                                });
                            });
                        });
                    }
                });
            },

            /** @return a promise to resolve with the hand of the player `id` */
            getHandForPlayer: function(id) {
                return $q(function(resolve, reject) {
                    if (!id in players) {
                        reject('player ' + id + ' not in ' + _.keys(players));
                    } else {
                        resolve(players[id].hand);
                    }
                });
            }
        };

    return engine;
});