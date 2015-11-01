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
                get: 'CALL',
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
                get: 'CALL',
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
            'ui.bootstrap',
            'ngStorage'
          ]);

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
    var urlBase = '/' + config.IISProjectName + '/';

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
 *  A service which provides shared variables
 */
app.factory('sharedProperties', function ($localStorage) {
    var service = {};

    service.getConfig = function () {
        return config;
    };

    service.getUser = function () {
        if($localStorage.user === undefined){
            $localStorage.user = {
                isLoggedIn: false
            };
        }
        return $localStorage.user;
    };
    service.setUser = function (value) {
        $localStorage.user = value;
        return $localStorage.user;
    };

    return service;
});