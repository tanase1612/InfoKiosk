/*
 *  A service which provides function for the user
 */
angular.module('SimPlannerApp')
    .factory('userService', function ($localStorage, $q, socketService, configService, sharedService) {
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
            var promise = $q.defer(),
                params = [];
            
            configService.getConfig()
                .then(function(response){
                    config = response.data;
                
                    params.push(
                        sharedService.sckParam(
                            'login',
                            's',
                            user.login
                        )
                    );
                        
                    params.push(
                        sharedService.sckParam(
                            'pwd',
                            's',
                            config.UseDefaultSignIn === true ? user.login : user.password
                        )
                    );
                
                    socketService.connect(config.globalCalls.signIn.name, config.globalCalls.signIn.verb, params, user)
                        .then(function(response){
                            if(response.flagerr){
                                promise.reject(response.errtx);
                            } else if(response.error){
                                promise.reject(response.data);
                            } else {
                                if (!response.error) {
                                    var user = response[0];
                                    
                                    user.userRole = 2;
                                    
                                    if(user.userRole === undefined || user.userRole === null){
                                        if(user.userText !== undefined && user.userText !== null){
                                            promise.reject("Error : User profile doesn't have sufficient setup.");
                                        } else {
                                            promise.reject("Error : Username doesn't exist.");
                                        }
                                    } else {
                                        user.isLoggedIn = true;
                                        user.login = user.userText;
                                        
                                        $localStorage.user = user;
                                    }
                                    
                                } else {
                                    promise.reject('Error : Login failed.');
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