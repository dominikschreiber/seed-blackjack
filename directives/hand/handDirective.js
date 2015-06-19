'use strict';

angular.module('blackjack.handDirective', [
    'ng'
])

.directive('hand', function() {
    return {
        scope: {
            content: '='
        },
        templateUrl: 'directives/hand/handDirective.tpl.html'
    };
});