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
            
            if(text.indexOf('.') === -1){
                if(text.charAt(0) === text.charAt(0).toLowerCase()){
                    return text;
                }
            }

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
        
        //  Find week number
        service.getWeek = function (date) {
            var d = new Date(date);
            d.setHours(0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
        };
    
        service.setMenuRoutes = function(views, user) {
            var canBeSeenBy,
                result = [];
            
            for (var i = 0; i < views.length; i++) {
                canBeSeenBy = views[i].canBeSeenBy

                if (canBeSeenBy !== undefined) {
                    for (var x = 0; x < canBeSeenBy.length; x++) {
                        if (canBeSeenBy[x] === user.userRole && views[i].showInMenu) {
                            result.push(views[i]);
                        }
                    }
                }
            }
            
            return result;
        };
    
        //  Creates a template for the Socket parameters
        service.sckParam = function(name, datatype, value) {
            var result = {
                Name: name,
                Datatype: datatype.toUpperCase(),
                Value: value
            };

            if (result.Datatype === 'D') {
                result.Value = '' + value.getFullYear() + '-' + ("0" + (value.getMonth() + 1)).slice(-2) + '-' + ("0" + value.getDate()).slice(-2);
            }

            return result;
        };
    
        //  Sorts an array based on a given variable
        service.sort = function(array, variable){
            return array.sort(function(a, b) {
                if (a[variable] < b[variable]) return -1;
                if (a[variable] > b[variable]) return 1;
                return 0;
            });
        };

        return service;
    });