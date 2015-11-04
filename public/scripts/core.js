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
            route: 'Arbejds Tider',

            //  functions available in the view.
            viewFunctions: {
                print: true,
                datePicker: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: {
                    name: 'CALL',
                    verb: 'rpAcListTime'
                },
                put: {
                    name: 'DUMMYDATA',
                    verb: 'multipleDates'
                },
                remove: {
                    name: 'DUMMYDATA',
                    verb: 'multipleDates'
                }
            },

            /*
             *  Which values should be shown in the view
             *  
             *  parm: shownName = text shown in the view
             *  parm: matchValue = variable name to match JSON value
             */
            values: [
                {
                    shownName: 'Dato',
                    matchValue: 'date'
                },
                {
                    shownName: 'Timer',
                    matchValue: 'hours'
                },
                {
                    shownName: 'Timeløn',
                    matchValue: 'salary'
                },
                {
                    shownName: 'Samlet',
                    matchValue: 'totalPayment'
                }
            ]
        },

        {
            //  view route: www.something.com/ name of route. default is the sign in page.
            route: 'Tidsplan',

            //  functions available in the view.
            viewFunctions: {
                print: true
            },

            //  Stored procedure to call for the data which whould be shown in the view.
            storedProcedure: {
                get: {
                    name: 'DUMMYDATA',
                    verb: 'singleDay'
                },
                put: {
                    name: 'DUMMYDATA',
                    verb: 'singleDay'
                },
                remove: {
                    name: 'DUMMYDATA',
                    verb: 'singleDay'
                }
            },

            /*
             *  Which values should be shown in the view
             *  
             *  parm: shownName = text shown in the view
             *  parm: matchValue = variable name to match JSON value
             */
            values: [
                {
                    shownName: 'Tid',
                    matchValue: 'date'
                },
                {
                    shownName: 'Opgave',
                    matchValue: 'task'
                }
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
app.config(function ($stateProvider) {
    var urlBase = '/' + config.IISProjectName + '/';

    $stateProvider
        .state('welcome', {
            url: "/welcome",
            templateUrl: urlBase + 'views/welcome.html',
            controller: 'welcomeController'
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

app.directive('ngPrint', function(){
        var printSection = document.getElementById('printSection');

        // if there is no printing section, create one
        if (!printSection) {
            printSection = document.createElement('div');
            printSection.id = 'printSection';
            document.body.appendChild(printSection);
        }

        function link(scope, element, attrs) {
            element.on('click', function () {
                var elemToPrint = document.getElementById(attrs.printElementId);
                if (elemToPrint) {
                    printElement(elemToPrint);
                    window.print();
                }
            });

            window.onafterprint = function () {
                // clean the print section before adding new content
                printSection.innerHTML = '';
            }
        }

        function printElement(elem) {
            // clones the element you want to print
            var domClone = elem.cloneNode(true);
            printSection.appendChild(domClone);
        }

        return {
            link: link,
            restrict: 'A'
        };
    });