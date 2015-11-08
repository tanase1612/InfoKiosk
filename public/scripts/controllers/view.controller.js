angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$interval', '$window', 'view', 'socketService', 'userService', function ($scope, $state, $interval, $window, view, socketService, userService) {
        var user = userService.get(),
            loop = {
                ready: true,
                iterations: 0
            };
        
        //  If there is no view, return to login page
        if (view === undefined) {
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
        
        if(loop.ready){
            get();
        }
        
        //  get new data every minute (60.000 milliseconds)
        $interval(function () {
            if(loop.ready){
                get();
            }
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
            var datesBetween,
                params = [],
                increment = 11,
                daysLeft,
                firstDate = $scope.datePicker.firstDate,
                secondDate = addDays($scope.datePicker.firstDate, -1),
                oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            loop.ready = false;
            
            if(view.viewFunctions.datePicker){
                datesBetween = Math.round(Math.abs(($scope.datePicker.firstDate.getTime() - $scope.datePicker.secondDate.getTime())/(oneDay)));
            }
            
            while(!loop.ready){
                params = [];
                
                if(view.viewFunctions.datePicker){
                    daysLeft = datesBetween - loop.iterations;
                    
                    firstDate = addDays(secondDate, 1);
                    if(firstDate.getTime() > $scope.datePicker.secondDate.getTime()){
                        firstDate = $scope.datePicker.secondDate;
                    }
                    console.log('firstDate : ', firstDate);
                    
                    secondDate = addDays(firstDate, increment);
                    if(secondDate.getTime() > $scope.datePicker.secondDate.getTime()){
                        secondDate = $scope.datePicker.secondDate;
                    }
                    console.log('secondDate : ', secondDate);
                    
                    if(daysLeft > (increment-1)){
                        loop.iterations = loop.iterations + increment;
                    } else {
                        loop.iterations = loop.iterations + daysLeft;
                    }
                    
                    if(daysLeft <= 0){
                        loop.ready = true;
                    }
                    
                    params.push({
                        name: 't0',
                        datatype: 'd',
                        value: firstDate
                    });

                    params.push({
                        name: 't1',
                        datatype: 'd',
                        value: secondDate
                    });
                }
                
                socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, user, function (response) {
                    $scope.$apply(function () {
                        var temp = sanitize(response.data[0]);
                        
                        for(var i = 0; i < temp.length; i++){
                            $scope.items.push(temp[i]);
                        }
                    });
                });
            }
        };
        
        function sanitize(data){
            var result = [];
            
            for(var i = 0; i < data.Data.length; i++){
                var temp = [];
                
                for(var x = 0; x < data.Fields.length; x++){
                    temp.push({
                        _id: generateId(),
                        param: data.Fields[x],
                        value: data.Data[i][x]
                    });
                }
                
                result.push(temp);
            }
            
            return result;
        };
        
        //function to add days to a given date. 
        function addDays(startDate,numberOfDays){
            var result = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate()+numberOfDays,
                startDate.getHours(),
                startDate.getMinutes(),
                startDate.getSeconds()
            );
            return result;
        };
        
        function generateId(separator) {
            var delim = separator || "-";

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
        };
    }]);