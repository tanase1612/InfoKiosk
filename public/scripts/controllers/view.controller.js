angular.module('SimPlannerApp')
    .controller('viewController', ['$scope', '$state', 'view', 'config', 'socketService', 'userService', function ($scope, $state, view, config, socketService, userService) {
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
        $scope.values = view.values;
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
            routes: false
        };
        $scope.routes = [];
        
        if(loop.ready){
            get();
        }
        
        setRoutes();

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
        
        $scope.fetch = function(){
            get();
        };
        
        //  When one datepicker is visible we want to hide the other.
        //  This is only relevant in small views.
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
        function allowedAccess(){
            var allowed = false;
            
            if (view !== undefined && user !== undefined && user.isLoggedIn) {
                for(var i = 0; i < view.canBeSeenBy.length; i++){
                    if(view.canBeSeenBy[i] === user.userRole){
                        allowed = true;
                    }
                }
            }
            
            if(!allowed){
                $state.go('signin');
            }
        };
        
        function setRoutes(){
            var views,
                canBeSeenBy;
            
            if(view.viewFunctions.showRoutes){
                views = config.views;
                for(var i = 0; i < views.length; i++){
                    canBeSeenBy = views[i].canBeSeenBy
                    
                    if(canBeSeenBy !== undefined){
                        for(var x = 0; x < canBeSeenBy.length; x++){
                            if(canBeSeenBy[x] === user.userRole && views[i].showInMenu){
                                $scope.routes.push(views[i]);
                            }
                        }
                    }
                }
            }
        };
        
        function setVisible(){
            if(view.storedProcedure){
                $scope.isVisible.items = true;
                $scope.isVisible.update = true;
            }
            
            if(view.viewFunctions.print){
                $scope.isVisible.print = true;
            }
            
            if(view.viewFunctions.datePicker){
                $scope.isVisible.datePicker = true;
            }
            
            if(view.viewFunctions.showRoutes){
                $scope.isVisible.routes = true;
            }
        };
        
        //  Creates a call to the WebSocket Server in order to get some data.
        function get() {
            if(view.storedProcedure){
                var datesBetween,
                    params = [],
                    increment = 11,
                    daysLeft,
                    firstDate = $scope.datePicker.firstDate,
                    secondDate = addDays($scope.datePicker.firstDate, -1),
                    oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                loop.ready = false;
                $scope.items = [];

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

                        secondDate = addDays(firstDate, increment);
                        if(secondDate.getTime() > $scope.datePicker.secondDate.getTime()){
                            secondDate = $scope.datePicker.secondDate;
                        }

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

                    if(view.tags){
                        for(var i = 0; i < view.tags.length; i++){
                            params.push({
                                name: view.tags[i].name,
                                datatype: view.tags[i].datatype,
                                value: view.tags[i].value
                            });
                        }
                    }

                    $scope.loading = true;
                    socketService.connect(view.storedProcedure.get.name, view.storedProcedure.get.verb, params, user)
                        .then(function(response){
                            $scope.items = response;
                        })
                        .catch(function(error){
                            console.log('Error : ', error);
                        })
                        .finally(function(){
                            $scope.loading = false;
                        });
                }
            }
        };
        
        //  function to add days to a given date. 
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
        
        //  Generates an unique id, to be added to the object in order for ng-repeat to seperate the different DOM elements.
        function generateId(separator) {
            var delim = separator || "-";

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
        };
    }]);