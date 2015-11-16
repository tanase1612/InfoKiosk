angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', '$state', '$interval', 'configService', 'userService', function ($scope, $location, $state, $interval, configService, userService) {
        var timeSpan;
        $scope.user = userService.get();
        $scope.config;
        $scope.clock = new Date();
        
        $interval(function(){
            $scope.clock = new Date();
        }, 1000);

        //  Update when the view changes.
        $scope.reload = function () {
            $state.reload();
        };
        $scope.$state = $state;
        $scope.$watch('$state.$current.locals.globals.view', function () {
            $scope.user = userService.get();
            if ($location.path() === '/signin') {
                $scope.user = userService.signOut();
            }
        });

        configService.getConfig()
            .then(function (response) {
                $scope.config = response.data;
                timeSpan = $scope.config.SessionTime;
            })
            .catch(function (error) {
                console.log('Error : ', error);
            });
    }]);