angular.module('SimPlannerApp')
    .controller('menuController', ['$scope', '$state', 'config', 'socketService', 'userService', 'sharedService', function ($scope, $state, config, socketService, userService, sharedService) {
        var user = userService.get();

        if (user === undefined || !user.isLoggedIn) {
            $state.go('signin');
        }

        /*
         *  Sets the models to be used in the view
         */
        $scope.routes = sharedService.setMenuRoutes(config.views, user);

        /*
         *  Functions used by the view
         */
        $scope.reroute = function(object, isView){
            sharedService.reroute(object, isView);
        };
    }]);