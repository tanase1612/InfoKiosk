angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$interval', '$window', 'view', 'socketService', 'sharedProperties', function ($scope, $state, $interval, $window, view, socketService, sharedProperties) {
        //  If there is no view, return to login page
        if (view === undefined || !sharedProperties.getUser().isLoggedIn) {
            $state.go('welcome');
        }

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
            for(var i = 0; i < e.length; i++){
                if (e[i].param === keyName) {
                    return e[i].value;
                }
            }
        };

        $scope.print = function () {
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
            
            socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, sharedProperties.getUser(), function (response) {
                $scope.$apply(function () {
                    $scope.items = sanitize(response.data[0]);
                });
            });
        };
        
        function sanitize(data){
            var result = [];
            
            for(var i = 0; i < data.Data.length; i++){
                var temp = [];
                
                for(var x = 0; x < data.Fields.length; x++){
                    temp.push({
                        param: data.Fields[x],
                        value: data.Data[i][x]
                    });
                }
                
                result.push(temp);
            }
            
            return result;
        };
    }]);