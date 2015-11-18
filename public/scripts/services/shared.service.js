angular.module('SimPlannerApp')
    .factory('sharedService', function ($state, $localStorage) {
        var service = {};
    
        service.reroute = function(object, isView){
            if(isView){
                $state.go('view', {
                    view: object.route
                });
            } else {
                $state.go(object);
            }
        };
    
        service.camelcase = function(text) {
            var result = '',
                nextToUpper = false,
                char;

            for (var i = 0; i < text.length; i++) {
                char = text.charAt(i);

                if (char === '.') {
                    nextToUpper = true;
                } else {
                    result += nextToUpper ? char.toUpperCase() : char.toLowerCase();
                    nextToUpper = false;
                }
            }

            return result;
        }

        return service;
    });