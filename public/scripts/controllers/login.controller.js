angular.module('SimPlannerApp')
    .controller('loginController', ['$scope', '$location', 'socketService', 'sharedProperties', function ($scope, $location, socketService, sharedProperties) {
        console.log('loginController ready for duty!');
        
        signOut();
        
        $scope.signIn = function(){
            var user = sharedProperties.getUser();
            user.isLoggedIn = true;
            sharedProperties.setUser(user);
            
            $location.path('/view/' + sharedProperties.getConfig().views[0].route);
        };
        
        function signOut(){
            var user = sharedProperties.getUser();
            user.isLoggedIn = false;
            sharedProperties.setUser(user);
        }
    }]);