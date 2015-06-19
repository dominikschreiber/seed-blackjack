angular.module('blackjack.playersDirective', ['blackjack.playerDirective', 'blackjack.engineService', 'ng'])

.directive('players', function(engine) {
    return {
        templateUrl: 'directives/players/playersDirective.tpl.html',
        link: function($scope, $element, $attributes) {
            $scope.players = [];

            $scope.join = function() {
                engine.addPlayer().then(function(player) {
                    $scope.players.push(player);
                    $scope.joined = true;
                });
            };
        }
    }
});