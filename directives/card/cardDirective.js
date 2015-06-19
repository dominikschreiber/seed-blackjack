'use strict';

angular.module('blackjack.cardDirective', ['ng'])

.directive('card', function() {
    return {
        scope: {
            value: '@',
            suit: '@',
            index: '@',
            of: '@'
        },
        templateUrl: 'directives/card/cardDirective.tpl.html'
    };
});