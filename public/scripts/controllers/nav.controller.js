angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', '$state', 'configService', 'userService', function ($scope, $location, $state, configService,  userService) {
        var config;
        $scope.nav;
        $scope.user = userService.get();
        
        configService.getConfig()
            .then(function(response){
                config = response.data;
                $scope.nav = config.views;
            })
            .catch(function(error){
                console.log('Error : ', error);
            });

        $scope.signIn = function () {
            userService.signIn($scope.user, function(response){
                if(response.isLoggedIn){
                    $scope.user = response;
                    
                    $location.path('view/' + config.views[0].route);
                }
            });
        };
    }]);