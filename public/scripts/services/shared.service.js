angular.module('SimPlannerApp')
    .factory('sharedService', function ($state, $localStorage, viewService) {
        var service = {};
    
        service.reroute = function(object, isView, parameters){
            if(isView){
                if(object.routeParameters !== undefined){
                    var value;
                    
                    if(object.routeParameters.date){
                        if(parameters !== undefined){
                            value = parameters.date;
                        } else {
                            value = new Date();
                        }
                        
                        viewService.setParameters(value, 'date');
                    }
                }
                
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