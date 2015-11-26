angular.module('SimPlannerApp')
    .factory('configService', function ($http, $q) {
        var service = {},
            config;

        service.getConfig = function () {
            var result = $q.defer();
            
            if(config === undefined){
                $http.get('config.json')
                    .then(function(response){
                        config = response;
                        result.resolve(config);
                    })
                    .catch(function(error){
                        result.reject(error);
                    });
            } else {
                result.resolve(config);
            }
            
            return result.promise;
        };

        return service;
    });