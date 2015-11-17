angular.module('SimPlannerApp')
    .controller('menuController', ['$scope', '$state', 'config', 'socketService', 'userService', function ($scope, $state, config, socketService, userService) {
        var user = userService.get();

        if (user === undefined || !user.isLoggedIn) {
            $state.go('signin');
        }

        /*
         *  Sets the models to be used in the view
         */
        $scope.routes = [];

        setRoutes();

        /*
         *  Functions used by the view
         */
        $scope.reroute = function(object){
            $state.go('view', {
                view: object.route
            });
        };

        /*
         *  Functions used by the controller
         */
        function setRoutes() {
            var views,
                canBeSeenBy;


            views = config.views;
            for (var i = 0; i < views.length; i++) {
                canBeSeenBy = views[i].canBeSeenBy

                if (canBeSeenBy !== undefined) {
                    for (var x = 0; x < canBeSeenBy.length; x++) {
                        if (canBeSeenBy[x] === user.userRole && views[i].showInMenu) {
                            $scope.routes.push(views[i]);
                        }
                    }
                }
            }

        };
    }]);