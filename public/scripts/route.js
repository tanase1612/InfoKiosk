angular.module('SimPlannerApp')
    .config(function ($stateProvider) {
        var urlBase = '/simplanner/';

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
                    view: function ($stateParams, configService) {
                        return configService.getConfig()
                            .then(function(response){
                                var config = response.data;
                                for (var i = 0; i < config.views.length; i++) {
                                    if (config.views[i].route === $stateParams.view) {
                                        return config.views[i];
                                    }
                                
                                }

                                return undefined;
                            })
                            .catch(function(error){
                                console.log('Error : ', error);
                                return undefined;
                            });
                    },
                    config: function (configService) {
                        return configService.getConfig()
                            .then(function(response){
                                return response.data;
                            })
                            .catch(function(error){
                                console.log('Error : ', error);
                                return undefined;
                            });
                    }
                }
            })
            .state('404', {
                url: '{path:.*}',
                templateUrl: urlBase + '/views/404.html',
                controller: 'errorController'
            });
    });