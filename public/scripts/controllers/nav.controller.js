angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', 'sharedProperties', 'socketService', function ($scope, $location, sharedProperties, socketService) {
        $scope.nav = sharedProperties.getConfig().views;
        $scope.user = sharedProperties.getUser();
        $scope.login = {};
        
        $scope.signIn = function(){
            if($scope.loginForm.$valid){
                socketService.connect('INIT', '', [], $scope.login, function(response){
                    if(response.payload.success){
                        $scope.user = $scope.login;
                        $scope.user.isLoggedIn = true;
                        $scope.user = sharedProperties.setUser($scope.user);

                        $scope.login = {};
                        
                        $location.path('view/' + sharedProperties.getConfig().views[0].route);
                    } else {
                        console.log('Error : Login failed');
                    }
                });
            }
        };
    }]);