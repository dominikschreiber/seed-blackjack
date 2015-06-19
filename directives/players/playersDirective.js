angular.module('blackjack.playersDirective', [
    'blackjack.playerDirective',
    'blackjack.engineService',
    'ng'
])

.directive('players', function(engine) {
    return {
        templateUrl: 'directives/players/playersDirective.tpl.html',
        link: function($scope, $element, $attributes) {
            $scope.joined = false;

            engine.getPlayers().then(function(players) {
                $scope.players = _.map(players, function(player) { return { id: player, human: false } });
            });

            $scope.join = function() {
                engine.addPlayer().then(function(player) {
                    $scope.players.push({ id: player, human: true });
                    $scope.joined = true;
                });
            };
        }
    }
});