'use strict';

angular.module('blackjack.cardDirective', ['ng'])

.directive('card', function($timeout) {
    return {
        scope: {
            content: '='
        },
        templateUrl: 'directives/card/cardDirective.tpl.html',
        link: function($scope, $element, $attributes) {
            $scope.isNew = true;
            $timeout(function() {
                $scope.isNew = false;
            }, 1);
        }
    };
});