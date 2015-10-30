/*
 *  Authors:
 *  Michael Tot Korsgaard : totkorsgaard@gmail.com
 *  Adi Tanase
 */

/*
 *  Configuration
 */
var config = {
    socketAddress: "ws://localhost:8081/Common",
    IISProjectName: "simplanner",
    views: [
        {
            //  view route: www.something.com/ name of route. default is the sign in page.
            route: 'arbejds tider',

            //  functions available in the view.
            viewFunctions: {
                print: true,
                datePicker: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: 'TESTCALL1',
                put: 'CALL',
                remove: 'CALL'
            },

            //  Which values should be shown in the view
            //  The first value in is the shown text, the second is variable to match the appropriate JSON value
            values: [
                    ['timer', 'hours'],
                    ['timeløn', 'salary'],
                    ['samlet', 'totalPayment']
                ]
        },

        {
            //  view route: www.something.com/ name of route. default is the sign in page.
            route: 'timer',

            //  functions available in the view.
            viewFunctions: {
                print: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: 'TESTCALL2',
                put: 'CALL',
                remove: 'CALL'
            },

            //  Which values should be shown in the view
            //  The first value in is the shown text, the second is variable to match the appropriate JSON value
            values: [
                    ['timer', 'hours']
                ]
        }
    ]
};

var app = angular.module('SimPlannerApp', [
            'ui.router',
            'ui.bootstrap'
          ]);

/*
 *  Services
 */
app.factory('socketService', function () {
        var service = {};
    
        service.connect = function (call, callback) {
            var socket = new WebSocket(config.socketAddress),   //  Connecting to socket server
                result;
            
            socket.onopen = function (){
                console.log("Server is on!");
                socket.send(JSON.stringify(call)) ;
            };
            
            socket.onmessage = function(response){
                console.log('\n' + new Date().toUTCString() + '\nServer responded');
                
                callback(JSON.parse(response.data));
            };
            
            socket.onclose = function(){
                socket.close;
                console.log("Socket is closed");
            };
        };
    
        return service;
    });

/*
 *  Filter
 */
app.filter('capitalize', function () {
        return function (input, all) {
            return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) : '';
        }
    })
    .filter('datetime', function ($filter) {
        return function (input) {
            if (input == null) {
                return "";
            }

            var _date = $filter('date')(new Date(input),
                'MMM dd yyyy - HH:mm:ss');

            return _date;

        };
    });

/*
 *  Routes
 */
app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    var urlBase = /*'/' + config.IISProjectName + '/'*/ '';
    
    //$locationProvider.html5Mode(true).hashPrefix('!');
    
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: urlBase + 'views/login.html',
            controller: 'loginController'
        })
        .state('view', {
            url: '/view/:view',
            templateUrl: urlBase + 'views/view.html',
            controller: 'viewController',
            resolve: {
                view: function ($stateParams) {
                    for (var i = 0; i < config.views.length; i++) {
                        if (config.views[i].route === $stateParams.view) {
                            return config.views[i];
                        }
                    }

                    return undefined;
                }
            }
        })
        .state('404', {
            url: '{path:.*}',
            templateUrl: urlBase + '/views/404.html',
            controller: 'errorController'
        });
});

/*
 *  Controllers
 */
app.controller('navController', ['$scope',  function ($scope) {
        console.log('navController ready for duty!');
        $scope.nav = config.views;
    }])
    .controller('loginController', ['$scope', 'socketService', function ($scope, socketService) {
        console.log('loginController ready for duty!');
        $scope.user = {
            isLoggedIn : false
        };
        
        $scope.signIn = function(){
            //  Do something
        };
    }])
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
        $interval(function() {
            get();
        }, 60000);
        
        /*
         *  Functions used by the view
         */
        $scope.findMatch = function(e, keyName){
            for(key in e){
                if(key === keyName){
                    return e[key];
                }
            }
        };
        
        $scope.print = function(){
            console.log('content is printed');
        };
        
        /*
         *  Functions used by the controller
         */
        function get(){
            socketService.connect(view.storedProcedure.get, function(response){
                $scope.$apply(function() {
                    $scope.items = response.data;
                });
            });
        }
    }])
    .controller('errorController', ['$scope', function ($scope) {
        console.log('errorController ready for duty!');
    }]);
