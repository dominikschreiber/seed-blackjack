'use strict';

angular.module('blackjack.cardDirective', ['ng'])

.directive('card', function() {
    return {
        scope: {
            content: '='
        },
        templateUrl: 'directives/card/cardDirective.tpl.html'
    };
});