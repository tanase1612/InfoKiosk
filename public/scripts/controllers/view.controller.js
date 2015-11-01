angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$interval', 'view', 'socketService', function ($scope, $state, $interval, view, socketService) {
    //  If there is no view, return to login page
    if (view === undefined) {
        $state.go('login');
    }

    console.log('viewController ready for duty!');

    /*
     *  Sets the models to be used in the view
     */
    $scope.values = view.values;
    $scope.title = view.route;
    $scope.viewFunctions = view.viewFunctions;
    $scope.items = [];
    get();

    //  get new data every minute (60.000 milliseconds)
    $interval(function () {
        get();
    }, 60000);

    /*
     *  Functions used by the view
     */
    $scope.findMatch = function (e, keyName) {
        for (key in e) {
            if (key === keyName) {
                return e[key];
            }
        }
    };

    $scope.print = function () {
        console.log('content is printed');
    };

    /*
     *  Functions used by the controller
     */
    function get() {
        socketService.connect(view.storedProcedure.get, function (response) {
            $scope.$apply(function () {
                $scope.items = response.data;
            });
        });
    }
}]);