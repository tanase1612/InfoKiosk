/*
 *  Authors:
 *  Michael Tot Korsgaard : totkorsgaard@gmail.com
 *  Adi Tanase
 */

var config = {
    socketAddress: "ws://localhost:8081/Common",
    views: [
        {
            //  view route: www.something.com/ name of route. default is the sign in page.
            route: 'salary',

            //  functions available in the view.
            viewFunctions: {
                print: true,
                datePicker: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: 'CALL',
                put: 'CALL',
                remove: 'CALL'
            },

            //  Which values should be shown in the view
            values: [
                    'hour',
                    'pay',
                    'total payment'
                ]
        },

        {
            //  view route: www.something.com/ name of route. default is the sign in page.
            route: 'hours',

            //  functions available in the view.
            viewFunctions: {
                print: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: 'CALL',
                put: 'CALL',
                remove: 'CALL'
            },

            //  Which values should be shown in the view
            values: [
                    'hour'
                ]
        }
    ]
};

var app = angular.module('SimPlannerApp', [
            'ui.router'
          ]);

app.factory('socketService', function () {
        var service = {};
    
        service.connect = function (call) {
            var socket = new WebSocket(config.socketAddress),   //  Connecting to socket server
                result;
            
            socket.onopen = function (){
                console.log("Server is on!");
                socket.send(JSON.stringify(call)) ;
            };
            
            socket.onmessage = function(response){
                console.log('response :', response.data);
                result = response.data;
            };
            
            socket.onclose = function(){
                socket.close;
                console.log("socket is closed");
            };
            
            return result;
        };
    
        return service;
    });

//  Routes
app.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to '/'
    $urlRouterProvider.otherwise("/login");

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('view', {
            url: '/view/:view',
            templateUrl: 'views/view.html',
            controller: 'viewController',
            resolve: {
                view: function ($stateParams, configService) {
                    for (var i = 0; i < config.views.length; i++) {
                        if (config.views[i].route === $stateParams.view) {
                            return config.views[i];
                        }
                    }

                    return undefined;
                }
            }
        });
});

//  Controllers
app.controller('navController', ['$scope',  function ($scope) {
    console.log('navController ready for duty!');
    $scope.nav = config.views;
}]);

app.controller('loginController', ['$scope', 'socketService', function ($scope, socketService) {
    console.log('loginController ready for duty!');
    $scope.message = "hi";
}]);

app.controller('viewController', ['$scope', '$state', 'view', 'socketService', function ($scope, $state, view, socketService) {
    if (view === undefined) {
        console.log('bob');
        $state.go('login');
    }

    console.log('viewController ready for duty!');
    
    
    console.log('data : ', socketService.connect('PRINT'));
    $scope.data = socketService.connect('PRINT');

    $scope.values = view.values;
}]);
