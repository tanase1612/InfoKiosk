/*
 *  A service which provides function for the user
 */
angular.module('SimPlannerApp')
    .factory('userService', function ($localStorage, $q, socketService, configService) {
        var service = {},
            config;

        service.get = function () {
            if($localStorage.user === undefined){
                return reset();
            } else{
                return $localStorage.user;
            }
        };

        service.set = function (user) {
            $localStorage.user = user;
            return $localStorage.user;
        };

        service.signIn = function (user) {
            var promise = $q.defer();
            
            configService.getConfig()
                .then(function(response){
                    config = response.data;
                
                    socketService.connect(config.globalCalls.signIn.name, config.globalCalls.signIn.verb, [], user)
                        .then(function(response){
                            if(response.flagerr){
                                promise.reject(response.errtx);
                            } else if(response.error){
                                promise.reject(response.data);
                            } else {
                                if (!response.error) {
                                    var user = response[0];
                                    
                                    user.userRole = 'bruger';
                                    
                                    if(user.userRole === undefined){
                                        promise.reject("Error : Username doesn't exist.");
                                    } else {
                                        user.isLoggedIn = true;
                                        
                                        $localStorage.user = user;
                                    }
                                    
                                } else {
                                    promise.reject('Error : Login failed');
                                    reset();
                                }
                                promise.resolve($localStorage.user);
                            }
                        })
                        .catch(function(error){
                            promise.reject(error);
                        });
                })
                .catch(function(error){
                    promise.reject(error);
                });
            
            
            return promise.promise;
        };

        service.signOut = function(user){
            return reset();
        };

        function reset() {
            $localStorage.user = {
                isLoggedIn: false,
                username: '',
                password: ''
            };

            return $localStorage.user;
        };

        return service;
    });