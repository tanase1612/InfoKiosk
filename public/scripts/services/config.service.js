angular.module('SimPlannerApp')
    .factory('configService', function ($http) {
        var service = {};

        service.getConfig = function () {
            return $http.get('config.json');
        };

        return service;
    });