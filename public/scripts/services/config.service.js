angular.module('SimPlannerApp')
    .factory('configService', function ($http) {
        var service = {};

        service.getConfig = function () {
            //$http.get('config.json').then(function(e){console.log(e)});
            return $http.get('config.json');
        };

        return service;
    });