angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', 'sharedProperties', function ($scope, $location, sharedProperties) {
        $scope.nav = sharedProperties.getConfig().views;
        $scope.user = sharedProperties.getUser();
        $scope.login = {};
        
        $scope.signIn = function(){
            if($scope.loginForm.$valid){
                $scope.user = $scope.login;
                $scope.user.isLoggedIn = true;
                $scope.user = sharedProperties.setUser($scope.user);
                
                $scope.login = {};
                
                $location.path('/view/' + sharedProperties.getConfig().views[0].route);   
            }
        };
    }]);