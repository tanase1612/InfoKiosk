var config = {
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

var app = angular.module('SimPlannerApp', ['ui.router']);


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
            templateUrl: '/views/view.html',
            controller: 'viewController',
            resolve: {
                view: function ($stateParams) {
                    for(var i = 0; i < config.views.length; i++){
                        if(config.views[i].route === $stateParams.view){
                            return config.views[i];
                        }
                    }
                    
                    return undefined;
                }
            }
        });
});

//  Controllers
app.controller('loginController', ['$scope', function ($scope) {
    console.log('loginController ready for duty!');
}]);

app.controller('viewController', ['$scope', '$state', 'view', function ($scope, $state, view) {
    if(view === undefined){
        $state.go('login');
    }
    
    console.log('viewController ready for duty!');
    
    $scope.values = view.values;
}]);

// Connecting to socket server
var socket = new WebSocket("ws://localhost:8082/Common");
socket.onopen = function (){
    console.log("Server is on!");
    socket.send(JSON.stringify("PRINT")) ;
};
socket.onmessage = function(data){
    console.log(data.data);  
};
socket.onclose = function(){
   socket.close;
console.log("socket is closed");
};