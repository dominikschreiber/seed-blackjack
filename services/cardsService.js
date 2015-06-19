'use strict';

angular.module('blackjack.cardsService', ['ng'])

.service('cards', function($q) {
    var drawncards = [];

    /** @return a promise to resolve with all cards available in a new deck */
    function getall() {
        return $q(function(resolve) {
            resolve(_.chain(['♣', '♠', '♥', '♦'])
                    .map(function(suit) {
                        return _.map(_.range(2,11).concat(['B', 'D', 'K', 'A']), function(value) {
                            return {value: value, suit: suit};
                        });
                    })
                    .reduce(function(deck, cards) { return deck.concat(cards); }, [])
                    .value());
        });
    }

    /** @return a promise to resolve with a drawn card that has not been drawn (or reject with 'deck empty') */
    function draw() {
        return $q(function(resolve, reject) {
            getall().then(function(all) {
                var card;

                if (all.length === drawncards.length) {
                    reject('deck empty. cards.reset() to get a new deck.');
                } else {
                    card = _.sample(_.without(all, drawncards));
                    drawncards.push(card);
                    resolve(card);
                }
            }, reject);
        });
    }

    /** @return a promise to reset the deck */
    function reset() {
        $q(function(resolve) {
            drawncards = [];
            resolve();
        });
    }

    return {
        draw: draw,
        reset: reset
    };
});