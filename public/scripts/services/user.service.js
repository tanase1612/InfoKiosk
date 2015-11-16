/*
 *  A service which provides function for the user
 */
angular.module('SimPlannerApp')
    .factory('userService', function ($localStorage, $q, socketService) {
        var service = {};

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
            
            socketService.connect('INIT', '', [], user)
                .then(function(response){
                    if (response.payload.success) {
                        $localStorage.user = user;
                        $localStorage.user.isLoggedIn = true;
                    } else {
                        console.log('Error : Login failed');
                        reset();
                    }

                    promise.resolve($localStorage.user);
                })
                .catch(function(error){
                    promise.reject('Error : ', error);
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