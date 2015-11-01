angular.module('SimPlannerApp')
    .controller('navController', ['$scope', 'sharedProperties', function ($scope, sharedProperties) {
        console.log('navController ready for duty!');
    
        $scope.nav = sharedProperties.getConfig().views;
        $scope.user = sharedProperties.getUser();
    }]);