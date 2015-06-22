'use strict';

angular.module('blackjack.strategyService', [
    'ng'
])

.service('strategy', function($q) {
    return {
        STICK: 'stick',
        HIT: 'hit',
        move: undefined
    };
})

.service('manualStrategy', function($q, $timeout, $rootScope, strategy) {
    var manualStrategy = angular.extend({}, strategy);

    manualStrategy.move = function() {
        return $q(function(resolve, reject) {
            var offHit = $rootScope.$on('game::controls::hit', function() {
                offHit();
                resolve(strategy.HIT);
            });
            var offStick = $rootScope.$on('game::controls::stick', function() {
                offStick();
                resolve(strategy.STICK);
            });
            $timeout(reject, 30 * 1000);
        });
    }

    return manualStrategy;
})

.service('remoteStrategy', function($q, $log, $timeout, strategy) {
    var remoteStrategy = angular.extend({}, strategy);

    remoteStrategy.move = function(hand) {
        return $q(function(resolve, reject) {
            $timeout(function() {
                if (hand.score() < 17) {
                    resolve(strategy.HIT);
                } else {
                    resolve(strategy.MISS);
                }
            }, 1 * 1000);
        });
    };

    return remoteStrategy;
});