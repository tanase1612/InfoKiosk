angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', '$state', '$interval', 'configService', 'userService', function ($scope, $location, $state, $interval, configService, userService) {
        var config;
        var timeSpan;
        $scope.nav;
        $scope.user = userService.get();

        //  Update when the view changes.
        $scope.reload = function () {
            $state.reload();
        };
        $scope.$state = $state;
        $scope.$watch('$state.$current.locals.globals.view', function () {
            if ($location.path() === '/welcome') {
                $scope.user = userService.signOut();
            }
        });

        configService.getConfig()
            .then(function (response) {
                config = response.data;
                $scope.nav = config.views;
                timeSpan = config.SessionTime;
            
                /*Defining time period per login session*/
                $interval(function () {
                    $scope.user = userService.signOut();
                    $state.go('welcome');
                }, 10000 * timeSpan);
            })
            .catch(function (error) {
                console.log('Error : ', error);
            });

        $scope.signIn = function () {
            userService.signIn($scope.user, function (response) {
                if (response.isLoggedIn) {
                    $scope.user = response;

                    $state.go('view', {
                        view: config.views[0].route
                    });
                }
            });
        };
    }]);