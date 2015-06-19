'use strict';

angular.module('blackjack.playerDirective', ['blackjack.engineService', 'blackjack.cardDirective', 'ng'])

.directive('player', function(engine) {
    return {
        scope: {
            id: '@name'
        },
        templateUrl: 'directives/player/playerDirective.tpl.html',
        link: function($scope, $element, $attributes) {
            $scope.canDrawMoreCards = true;
            $scope.isValid = true;
            engine.getHandForPlayer($scope.id).then(function(hand) {
                $scope.hand = hand; // binds hand to $scope.hand, will update as drawCardForPlayer is called

                $scope.hit = function() {
                    engine.drawCardForPlayer($scope.id).then(function(result) {
                        $scope.canDrawMoreCards = result.canDrawMoreCards;
                        $scope.isValid = result.isValid;
                    });
                };
            });

            $scope.bc = function(i) {
                return 
            }
        }
    };
});