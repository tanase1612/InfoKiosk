angular.module('SimPlannerApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('signin', {
                url: "/signin",
                templateUrl: 'views/signin.html',
                controller: 'signinController'
            })
            .state('menu', {
                url: "/menu",
                templateUrl: 'views/menu.html',
                controller: 'menuController',
                resolve: {
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
            .state('view', {
                url: '/view/:view',
                templateUrl: 'views/view.html',
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
                templateUrl: 'views/404.html',
                controller: 'errorController'
            });
    });