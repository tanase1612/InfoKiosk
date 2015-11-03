angular.module('SimPlannerApp')
    .controller('welcomeController', ['$scope', 'sharedProperties', function ($scope, sharedProperties) {
        console.log('welcomeController ready for duty!');
        
        signOut();
        
        function signOut(){
            var user = sharedProperties.getUser();
            user.isLoggedIn = false;
            sharedProperties.setUser(user);
        }
    }]);