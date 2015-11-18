angular.module('SimPlannerApp')
    .controller('navController', ['$scope', '$location', '$state', '$interval', '$rootScope', 'configService', 'userService', 'sharedService', function ($scope, $location, $state, $interval, $rootScope, configService, userService, sharedService) {
        var timeSpan;
        $scope.user = userService.get();
        $scope.config;
        $scope.clock = new Date();

        $interval(function () {
            $scope.clock = new Date();
        }, 1000);

        //  Update when the view changes.
        $rootScope.$on('$locationChangeStart', function () {
            $scope.user = userService.get();

            if ($location.path() === '/signin') {
                $scope.user = userService.signOut();
            }
        });

        configService.getConfig()
            .then(function (response) {
                $scope.config = response.data;
                timeSpan = $scope.config.SessionTime;


                $interval(function () {
                    var path = $location.path();
                    if (path.substring(0, 5) === '/view') {
                        console.log('first atempt');
                        $scope.user = userService.signOut();
                        sharedService.reroute('signin', false);
                    }
                }, 60000 * timeSpan);

            })
            .catch(function (error) {
                console.log('Error : ', error);
            });

        $scope.reroute = function (object, isView) {
            sharedService.reroute(object, isView);
        };
    }]);