angular.module('SimPlannerApp')
    .controller('welcomeController', ['$scope', 'sharedProperties', 'socketService', function ($scope, sharedProperties, socketService) {
        signOut();
        
        function signOut(){
            var user = sharedProperties.getUser();
            user.isLoggedIn = false;
            sharedProperties.setUser(user);
        };
    }]);