angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', '$rootScope', '$q', 'view', 'config', 'socketService', 'userService', 'sharedService', 'viewService', function ($scope, $state, $rootScope, $q, view, config, socketService, userService, sharedService, viewService) {
        var user = userService.get(),
            loop = {
                ready: true,
                iterations: 0
            },
            dropdowns = [],
            parameters = {
                qryusr: user.login
            }

        //  If there is no view, return to login page
        allowedAccess();

        /*
         *  Sets the models to be used in the view
         */
        $scope.pop = {
            error: {
                message: ''
            },
            hide: true,
            timeout: function () {
                $timeout(function () {
                    $scope.pop.hide = true;
                }, 10000);
            },
            showPop: function (message) {
                $scope.pop.hide = false;
                $scope.pop.error.message = message;
                $scope.pop.timeout();
            }
        };
        $scope.values;
        $scope.title = view.route;
        $scope.items = [];
        $scope.datePicker = {
            firstDate: new Date(),
            secondDate: new Date(),
            minDate: new Date(),
            maxDate: new Date()
        };
        $scope.config = config;
        $scope.loading = false;
        $scope.isVisible = {
            update: false,
            items: false,
            print: false,
            datePicker: false,
            showWeekNr: false,
            calculate: false,
            summarize: false,
            dropdown: false
        };
        $scope.calculations = [];
        $scope.pickWeek;
        $scope.alert = {
            show: function () {
                return $scope.items.length === 0;
            },
            message: function () {
                if ($scope.loading) {
                    return "Looking for data.";
                }
                if ($scope.items.length === 0) {
                    return "There was no data.";
                }
            }
        }
        $scope.summarize = [];
        $scope.dropdown = {
            models: [],
            selects: []
        };

        setValues();
        setVisible();

        if (loop.ready) {
            get();
        }

        /*
         *  Functions used by the view
         */
        $scope.findMatch = function (e, keyName) {
            return findMatch(e, keyName);
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
        $scope.changeWeek = function (previousWeek) {
            var date = previousWeek === true ? addDays(viewService.getParamDate(), -7) : addDays(viewService.getParamDate(), 7);

            viewService.setParameters(date, 'date');

            $scope.pickWeek = getWeek(date);

            get();
        };
                
        //  Used by the dropdowns, to populate other objects.
        $scope.dropdownSelected = function(item, index){
            var selects = $scope.dropdown.selects,
                master = selects[index],
                slave = selects[index+1];
            
            if(item.value === null){
                if(slave !== undefined){
                    selects.length = index+1;
                    
                    var slaveParams = slave.populate.params;
                    if(slaveParams !== undefined){
                        for(var i = 0; i < slaveParams.length; i++){
                            slaveParams[i].Value = null;
                        }
                    }

                    setDropdown(slave);
                } else {
                    item = selects[selects.length-1].items[selects[selects.length-1].items.length-2];
                    
                    if(view.storedProcedure.get.parameters.qryusr){
                        if(item.value.resId){
                            parameters.qryusr = null;
                        }
                    }
                    
                    connect();
                }
            } else {
                if(master.slave.length > 0){
                    selects.length = index+1;
                    
                    var slaveParams = slave.populate.params;
                    if(slaveParams !== undefined){
                        for(var i = 0; i < slaveParams.length; i++){
                            slaveParams[i].Value = findMatch(item.value, sharedService.camelcase(slaveParams[i].originalValue));
                        }
                    }
                    
                    setDropdown(slave);
                } else {
                    if(view.storedProcedure.get.parameters.qryusr){
                        if(item.value.resId){
                            parameters.qryusr = item.value.resTag;
                        }
                    }
                    
                    connect();
                }
            }
        };

        /*
         *  Functions used by the controller
         */

        //  Look for the value of a key
        function findMatch(e, keyName) {
            for (key in e) {
                if (key === keyName) {
                    return e[key];
                }
            }
        };

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

        function setValues() {
            $scope.loading = true;
            var result = [],
                values = view.values;

            for (var i = 0; i < values.length; i++) {
                values[i].matchValue = sharedService.camelcase(values[i].matchValue);
                result.push(values[i]);
            }

            $scope.values = result;
            $scope.loading = false;
        };

        function setVisible() {
            var functions = view.viewFunctions;

            if (view.storedProcedure) {
                $scope.isVisible.items = true;
                $scope.isVisible.update = true;
            }

            if (functions.print) {
                $scope.isVisible.print = true;
            }

            if (functions.datePicker) {
                var datepicker = functions.datePicker;
                $scope.isVisible.datePicker = true;

                if (datepicker.maxDate) {
                    if (datepicker.maxDate === "today") {
                        $scope.datePicker.maxDate = new Date();
                    }
                } else {
                    $scope.datePicker.maxDate = new Date('2115/01/01');
                }
            }

            if (functions.pickWeek) {
                $scope.isVisible.pickWeek = true;

                if (viewService.getParamDate() === undefined) {
                    viewService.setParameters(new Date(), 'date');
                }

                $scope.pickWeek = getWeek(viewService.getParamDate());
            }

            if (functions.calculate) {
                $scope.isVisible.calculate = true;
            }

            if (functions.summarize) {
                $scope.isVisible.summarize = true;
            }

            if (functions.dropdown) {
                $scope.isVisible.dropdown = true;

                setDropdown(functions.dropdown);
            }
        };

        //  populates the dropdown with the correct data
        function setDropdown(dropdown) {
            var get = dropdown.populate.name,
                verb = dropdown.populate.verb,
                params = dropdown.populate.params === undefined ? [] : dropdown.populate.params,
                result = {
                    index: $scope.dropdown.selects.length,
                    name: dropdown.name,
                    items: [],
                    slave: [],
                    populate: {
                        name: dropdown.populate.name,
                        verb: dropdown.populate.verb,
                        params: dropdown.populate.params === undefined ? [] : dropdown.populate.params,
                        itemFieldName: dropdown.populate.itemFieldName
                    }
                },
                model = {
                    item: {}
                };
            
            if($scope.dropdown.models[result.index] === undefined){
                $scope.dropdown.models.push(model);
            }
            
            socketService.connect(get, verb, params, user, view)
                .then(function (response) {
                    for(var i = 0; i < response.length; i++){
                        result.items.push({
                            name: findMatch(response[i], sharedService.camelcase(dropdown.populate.itemFieldName)),
                            value: response[i]
                        });
                    }
                
                    result.items.sort(function(a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                
                    if(result.items.length > 0){
                        result.items.push({
                            name: 'All',
                            value: null
                        });
                    }
                
                    if(dropdown.slave !== undefined){
                        if(dropdown.slave.length !== undefined){
                            for(var i = 0; i < dropdown.slave.length; i++){
                                result.slave.push(dropdown.slave[i]);
                            }
                        } else {
                            result.slave.push(dropdown.slave);
                        }
                    }
                
                    $scope.dropdown.selects.push(result);
                
                    for(var j = 0; j < result.slave.length; j++){
                        var thisSlave = result.slave[j],
                            slaveParams = thisSlave.populate.params;
                        
                        if(slaveParams !== undefined && thisSlave.populate.verb !== undefined){
                            for(var i = 0; i < slaveParams.length; i++){
                                var name = slaveParams[i].name,
                                    datatype = slaveParams[i].datatype,
                                    itemValue = result.items[0].value,
                                    slaveValue = slaveParams[i].value,
                                    value,
                                    originalValue;
                                
                                if(name === undefined){
                                    name = slaveParams[i].Name;
                                }
                                if(datatype === undefined){
                                    datatype = slaveParams[i].Datatype;
                                }
                                if(slaveValue === undefined){
                                    slaveValue = slaveParams[i].Value;
                                }
                                
                                if(slaveParams[i].originalValue !== undefined){
                                    originalValue = slaveParams[i].originalValue;
                                    slaveValue = originalValue;
                                } else{
                                    originalValue = slaveValue;
                                }
                                
                                value = findMatch(itemValue, sharedService.camelcase(slaveValue));
                                
                                slaveParams[i] = sharedService.sckParam(name, datatype, value);
                                
                                slaveParams[i].originalValue = originalValue;
                            }
                            
                            thisSlave.populate.params = slaveParams;
                            
                            result.slave[j] = thisSlave;
                            
                            setDropdown(result.slave[j]);
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    $scope.dropdown.selects.push(result);
                });
        };

        //  Creates a call to the WebSocket Server in order to get some data.
        function get() {
            if (view.storedProcedure) {
                var datesBetween,
                    increment = 8,
                    firstDate = $scope.datePicker.firstDate,
                    secondDate = addDays($scope.datePicker.firstDate, -1),
                    oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                loop.ready = false;
                $scope.items = [];

                if (view.viewFunctions.datePicker) {
                    datesBetween = Math.round(Math.abs(($scope.datePicker.firstDate.getTime() - $scope.datePicker.secondDate.getTime()) / (oneDay)));
                }

                $scope.calculations = [];
                $scope.summarize = [];

                connect(datesBetween, increment, firstDate, secondDate);
            }
        };

        function connect(datesBetween, increment, firstDate, secondDate) {
            var params = [],
                daysLeft;
            loop.ready = true;

            if (view.storedProcedure.get.parameters.dt) {
                params.push(
                    sharedService.sckParam(
                        'dt',
                        's',
                        view.storedProcedure.get.parameters.dt
                    )
                );
            }

            if (view.storedProcedure.get.tags) {
                var tags = view.storedProcedure.get.tags;

                for (var i = 0; i < tags.length; i++) {
                    params.push(
                        sharedService.sckParam(
                            tags[i].name,
                            tags[i].datatype,
                            tags[i].value
                        )
                    );
                }
            }

            if (view.storedProcedure.get.parameters.qryusr) {
                params.push(
                    sharedService.sckParam(
                        'qryusr',
                        's',
                        parameters.qryusr
                    )
                );
            }

            if (view.storedProcedure.get.parameters.login) {
                params.push(
                    sharedService.sckParam(
                        'login',
                        's',
                        user.login
                    )
                );
            }

            if (view.storedProcedure.get.parameters.pwd) {
                params.push(
                    sharedService.sckParam(
                        'pwd',
                        's',
                        config.UseDefaultSignIn === true ? user.login : user.password
                    )
                );
            }

            if (view.viewFunctions.datePicker) {
                firstDate = $scope.datePicker.firstDate;
                secondDate = $scope.datePicker.secondDate;
                /*daysLeft = datesBetween - loop.iterations;

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
                }*/

                if (view.viewFunctions.datePicker.pickWeeks) {
                    firstDate = getFirstDayOfWeek(firstDate);
                    secondDate = getLastDayOfWeek(secondDate);

                    $scope.datePicker.firstDate = firstDate;
                    $scope.datePicker.secondDate = secondDate;
                }

                params.push(
                    sharedService.sckParam(
                        't0',
                        'd',
                        firstDate
                    )
                );

                params.push(
                    sharedService.sckParam(
                        't1',
                        'd',
                        secondDate
                    )
                );
            }

            if (view.routeParameters) {
                if (view.routeParameters.date) {
                    var doesExist = params.filter(function (obj) {
                            return obj.name === 't0';
                        }),
                        date = getFirstDayOfWeek(viewService.getParamDate());

                    if (doesExist.length > 0) {
                        doesExist[0].value = date;
                    } else {
                        params.push(
                            sharedService.sckParam(
                                't0',
                                'd',
                                date
                            )
                        );
                    }

                    doesExist = params.filter(function (obj) {
                        return obj.name === 't1';
                    });

                    date = addDays(date, 7);

                    if (doesExist.length > 0) {
                        doesExist[0].value = date;
                    } else {
                        params.push(
                            sharedService.sckParam(
                                't1',
                                'd',
                                date
                            )
                        );
                    }
                }
            }

            $scope.loading = true;
            socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, user, view)
                .then(function (response) {
                    calculate(response);
                    summarize(response);

                    for (var i = 0; i < response.length; i++) {
                        $scope.items.push(response[i]);
                    }

                    /*if (!loop.ready) {
                        connect(datesBetween, increment, daysLeft, firstDate, secondDate);
                    }*/
                
                    //$scope.items = sharedService.sort($scope.items, $scope.values[0]);
                })
                .catch(function (error) {
                    console.log('Error : ', error);
                })
                .finally(function () {
                    $scope.loading = false;
                });
        };

        //  Summarize each row of data
        function summarize(data) {
            if (view.viewFunctions.summarize) {
                var result = [],
                    values = $scope.values,
                    object = {
                        value: 0,
                        type: '',
                        format: ''
                    }

                if ($scope.summarize.length > 0) {
                    result = $scope.summarize;
                }

                for (var i = 0; i < values.length; i++) {
                    if (result.length !== values.length) {
                        result[i] = object;
                        object = {
                            value: 0,
                            type: '',
                            format: ''
                        };

                        result[i].type = values[i].type;
                        result[i].format = values[i].format;
                    }

                    for (var j = 0; j < data.length; j++) {
                        if (values[i].type === 'digits') {
                            var value = findMatch(data[j], values[i].matchValue);

                            if (value !== null) {
                                result[i].value += value;
                            }
                        } else {
                            result[i] = {};
                        }
                    }
                }

                $scope.summarize = result;
            }
        };

        //  Make calculations for the view, based on given data and viewFunctions.calculate values.
        function calculate(data) {
            if (view.viewFunctions.calculate) {
                var result = [],
                    calculations = view.viewFunctions.calculate;

                if ($scope.calculations.length > 0) {
                    result = $scope.calculations;
                }

                for (var i = 0; i < calculations.length; i++) {
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
                        } else if (char !== ' ') {
                            if (startRow) {
                                rowObject.name += char.toString();
                            } else {
                                calc.push(char.toString());
                            }
                        }
                    }

                    for (var x = 0; x < data.length; x++) {
                        var dataObj = data[x];

                        for (var z = 0; z < rows.length; z++) {
                            var rowObj = rows[z];

                            for (key in dataObj) {
                                if (key === rowObj.name) {
                                    if (dataObj[key] !== null && dataObj[key] !== undefined) {
                                        rowObj.value = rowObj.value + dataObj[key];
                                    }
                                }
                            }
                        }
                    }

                    for (var x = 0; x < calc.length; x++) {
                        math += rows[x].value + calc[x];
                    }
                    math += rows[rows.length - 1].value;

                    result.push({
                        name: calculations[i].shownName,
                        value: calculator(math)
                    })
                }

                $scope.calculations = result;
            }
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

        //  Find first date of the week
        function getFirstDayOfWeek(d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }

        //  Find the last date of a week
        function getLastDayOfWeek(date) {
            var firstDay = getFirstDayOfWeek(date);

            return addDays(firstDay, 6);
        };

        //  Find week number
        function getWeek(date) {
            return sharedService.getWeek(date);
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