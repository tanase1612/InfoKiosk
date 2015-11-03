angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$interval', '$window', 'view', 'socketService', function ($scope, $state, $interval, $window, view, socketService) {
        //  If there is no view, return to login page
        if (view === undefined) {
            $state.go('welcome');
        }

        console.log('viewController ready for duty!');

        /*
         *  Sets the models to be used in the view
         */
        $scope.values = view.values;
        $scope.title = view.route;
        $scope.viewFunctions = view.viewFunctions;
        $scope.items = [];
        $scope.datePicker = {
            firstDate: new Date(),
            secondDate: new Date(),
            minDate: new Date(),
        };
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
            
            $window.print();
        };
        
        $scope.fetch = function(){
            get();
        };
        
        $scope.toggleDatepicker = function(value){
            if(value.toLowerCase() === 'first'){
                $scope.datepickerFirst = !$scope.datepickerFirst;
                $scope.datepickerSecond = false;
            } 
            if(value.toLowerCase() === 'second'){
                $scope.datepickerSecond = !$scope.datepickerSecond;
                $scope.datepickerFirst = false;
            }
        };

        /*
         *  Functions used by the controller
         */
        function get() {
            var params = [];
            
            if(view.viewFunctions.datePicker){
                params.push({
                    name: 't0',
                    datatype: 'd',
                    value: $scope.datePicker.firstDate
                });
                
                params.push({
                    name: 't1',
                    datatype: 'd',
                    value: $scope.datePicker.secondDate
                });
            }
            
            socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, function (response) {
                $scope.$apply(function () {
                    $scope.items = response.data;
                });
            });
        };
    }]);