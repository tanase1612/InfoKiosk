angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$rootScope', 'view', 'config', 'socketService', 'userService', 'sharedService', 'viewService', function ($scope, $state, $rootScope, view, config, socketService, userService, sharedService, viewService) {
        var user = userService.get(),
            loop = {
                ready: true,
                iterations: 0
            };

        //  If there is no view, return to login page
        allowedAccess();

        /*
         *  Sets the models to be used in the view
         */
        $scope.values;
        $scope.title = view.route;
        $scope.items = [];
        $scope.datePicker = {
            firstDate: new Date(),
            secondDate: new Date(),
            minDate: new Date(),
        };
        $scope.config = config;
        $scope.loading = false;
        $scope.isVisible = {
            update: false,
            items: false,
            print: false,
            datePicker: false,
            showWeekNr: false,
            calculate: false
        };
        $scope.calculations = [];
        $scope.pickWeek;
        $scope.alert = {
            show: function(){
                return $scope.items.length === 0;  
            },
            message: function(){
                if($scope.loading){
                    return "Looking for data.";
                }
                if($scope.items.length === 0){
                    return "There was no data.";
                }
            }
        }

        setValues();
        setVisible();

        if (loop.ready) {
            get();
        }

        /*
         *  Functions used by the view
         */
        $scope.findMatch = function (e, keyName) {
            for (key in e) {
                if(key === keyName){
                    return e[key];
                }
            }
        };

        $scope.fetch = function () {
            get();
        };

        //  When one datepicker is visible we want to hide the other.
        //  This is only relevant in small views.
        $scope.toggleDatepicker = function (value) {
            if (value.toLowerCase() === 'first') {
                $scope.datepickerFirst = !$scope.datepickerFirst;
                $scope.datepickerSecond = false;
            }
            if (value.toLowerCase() === 'second') {
                $scope.datepickerSecond = !$scope.datepickerSecond;
                $scope.datepickerFirst = false;
            }
        };
        
        //  Used to change the view to resemble the next or previous week
        $scope.changeWeek = function(previousWeek){
            var date = previousWeek === true ? addDays(viewService.getParamDate(), -7) : addDays(viewService.getParamDate(), 7);
            
            viewService.setParameters(date, 'date');
            
            $scope.pickWeek = getWeek(date);
            
            get();
        };

        /*
         *  Functions used by the controller
         */
        function allowedAccess() {
            var allowed = false;

            if (view !== undefined && user !== undefined && user.isLoggedIn) {
                for (var i = 0; i < view.canBeSeenBy.length; i++) {
                    if (view.canBeSeenBy[i] === user.userRole) {
                        allowed = true;
                    }
                }
            }

            if (!allowed) {
                $state.go('signin');
            }
        };

        function setValues(){
            $scope.loading = true;
            var result = [],
                values = view.values;
            
            for(var i = 0; i < values.length; i++){
                values[i].matchValue = sharedService.camelcase(values[i].matchValue);
                result.push(values[i]);
            }
            
            $scope.values = result;
            $scope.loading = false;
        };
        
        function setVisible() {
            if (view.storedProcedure) {
                $scope.isVisible.items = true;
                $scope.isVisible.update = true;
            }

            if (view.viewFunctions.print) {
                $scope.isVisible.print = true;
            }

            if (view.viewFunctions.datePicker) {
                $scope.isVisible.datePicker = true;
            }
            
            if(view.viewFunctions.pickWeek){
                $scope.isVisible.pickWeek = true;
                
                if(viewService.getParamDate() === undefined){
                    viewService.setParameters(new Date(), 'date');
                }
                
                $scope.pickWeek = getWeek(viewService.getParamDate());
            }
            
            if (view.viewFunctions.calculate) {
                $scope.isVisible.calculate = true;
            }
        };

        //  Creates a call to the WebSocket Server in order to get some data.
        function get() {
            if (view.storedProcedure) {
                var datesBetween,
                    increment = 11,
                    firstDate = $scope.datePicker.firstDate,
                    secondDate = addDays($scope.datePicker.firstDate, -1),
                    oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                loop.ready = false;
                $scope.items = [];

                if (view.viewFunctions.datePicker) {
                    datesBetween = Math.round(Math.abs(($scope.datePicker.firstDate.getTime() - $scope.datePicker.secondDate.getTime()) / (oneDay)));
                }
                
                $scope.calculations = [];

                connect(datesBetween, increment, firstDate, secondDate);
            }
        };

        function connect(datesBetween, increment, firstDate, secondDate) {
            var params = [],
                daysLeft;
            loop.ready = true;

            if (view.viewFunctions.datePicker) {
                daysLeft = datesBetween - loop.iterations;

                firstDate = addDays(secondDate, 1);
                if (firstDate.getTime() > $scope.datePicker.secondDate.getTime()) {
                    firstDate = $scope.datePicker.secondDate;
                }

                secondDate = addDays(firstDate, increment);
                if (secondDate.getTime() > $scope.datePicker.secondDate.getTime()) {
                    secondDate = $scope.datePicker.secondDate;
                }

                if (daysLeft > (increment - 1)) {
                    loop.iterations = loop.iterations + increment;
                } else {
                    loop.iterations = loop.iterations + daysLeft;
                }

                if (daysLeft > 0) {
                    loop.ready = false;
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

            if(view.routeParameters){
                if(view.routeParameters.date){
                    var doesExist = params.filter(function( obj ) {
                            return obj.name === 't0';
                        }),
                        date = getFirstDayOfWeek(viewService.getParamDate());
                    
                    if(doesExist.length > 0){
                        doesExist[0].value = date;
                    } else {
                        params.push({
                            name: 't0',
                            datatype: 'd',
                            value: date
                        });
                    }
                    
                    doesExist = params.filter(function( obj ) {
                        return obj.name === 't1';
                    });
                    
                    date = addDays(date, 7);

                    if(doesExist.length > 0){
                        doesExist[0].value = date;
                    } else {
                        params.push({
                            name: 't1',
                            datatype: 'd',
                            value: date
                        });
                    }
                }
            }

            $scope.loading = true;
            socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, user, view)
                .then(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        $scope.items.push(response[i]);
                    }
                
                    calculate(response);

                    if (!loop.ready) {
                        connect(datesBetween, increment, daysLeft, firstDate, secondDate);
                    }
                })
                .catch(function (error) {
                    console.log('Error : ', error);
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };
        
        //  Make calculations for the view, based on given data and viewFunctions.calculate values.
        function calculate(data){
            console.log('data : ', data);
            
            var result = [],
                calculations = view.viewFunctions.calculate;
            
            if($scope.calculations.length > 0){
                result = $scope.calculations;
            }
            
            for(var i = 0; i < calculations.length; i++){
                var rows = [],
                    rowObject = {
                        name: '',
                        value: 0
                    },
                    startRow = false,
                    calc = [],
                    calculation = calculations[i].calculation,
                    math = '';
                
                for (var x = 0; x < calculation.length; x++) {
                    char = calculation.charAt(x);

                    if (char === '[') {
                        startRow = true;
                    } else if (char === ']') {
                        startRow = false;
                        rowObject.name = sharedService.camelcase(rowObject.name);
                        rows.push(rowObject);
                        rowObject = {
                            name: '',
                            value: 0
                        };
                        rowObject.name = '';
                    } else if(char !== ' '){
                        if(startRow){
                            rowObject.name += char.toString();
                        } else {
                            calc.push(char.toString());
                        }
                    }
                }
                
                for(var x = 0; x < data.length; x++){
                    var dataObj = data[x];
                    
                    for(var z = 0; z < rows.length; z++){
                        var rowObj = rows[z];
                        
                        for (key in dataObj) {
                            if(key === rowObj.name){
                                if(dataObj[key] !== null && dataObj[key] !== undefined){
                                    rowObj.value = rowObj.value + dataObj[key];
                                }
                            }
                        }
                    }
                }
                
                for(var x = 0; x < calc.length; x++){
                    math += rows[x].value + calc[x];
                }
                math += rows[rows.length-1].value;
                
                console.log('math : ', math);
                
                result.push({
                    name: calculations[i].shownName,
                    value : calculator(math)
                })
                
                console.log('rows : ', rows);
                console.log('calc : ', calc);
            }
                
            console.log('result : ', result);
            $scope.calculations = result;
        };
        
        //  Quick calculator
        function calculator(fn) {
            return new Function('return ' + fn)();
        }


        //  Add days to a given date. 
        function addDays(startDate, numberOfDays) {
            var result = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                startDate.getDate() + numberOfDays,
                startDate.getHours(),
                startDate.getMinutes(),
                startDate.getSeconds()
            );
            return result;
        };

        //  Find first day of the week
        function getFirstDayOfWeek(d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }
        
        //  Find week number
        function getWeek(date){
            var d = new Date(date);
            d.setHours(0,0,0);
            d.setDate(d.getDate()+4-(d.getDay()||7));
            return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
        }

        //  Generates an unique id, to be added to the object in order for ng-repeat to seperate the different DOM elements.
        function generateId(separator) {
            var delim = separator || "-";

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
        };
    }]);