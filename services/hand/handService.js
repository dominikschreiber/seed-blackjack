'use strict';

angular.module('blackjack.handService', [
    'ng'
])

.service('hand', function() {
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

    return function(cards) {
        return {
            cards: cards,
            score: function() { return optimalScore(cards); },
            playable: function() { return optimalScore(cards) < 21; }
        };
    };
});