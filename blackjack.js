'use strict';

angular.module('blackjack', [
    'blackjack.strategyService',
    'blackjack.gameService',
    'blackjack.cardDirective',
    'blackjack.handDirective',
    'ng'
])

.controller('BlackjackController', function($q, $rootScope, $scope, $log, $timeout, game, remoteStrategy, manualStrategy) {
    game.addPlayer({ is: 'dealer', strategy: remoteStrategy }).then(function(players) {
        $scope.players = players;
        game.run();
    });

    $scope.join = function() {
        game.addPlayer({ is: 'human', strategy: manualStrategy }).then(function(players) {
            $scope.players = players;
            game.run();
        });
    };

    $scope.hit = function() {
        $rootScope.$emit('game::controls::hit');
    };

    $scope.stick = function() {
        $rootScope.$emit('game::controls::stick');
    };

    $rootScope.$on('game::round::end', function(event, result) {
        $scope.result = result;
        $timeout(function() {
            $scope.result = undefined;
        }, 3 * 1000);
    });
});