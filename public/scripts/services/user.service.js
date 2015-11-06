/*
 *  A service which provides function for the user
 */
angular.module('SimPlannerApp')
    .factory('userService', function ($localStorage, socketService) {
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

        service.signIn = function (user, callback) {
            socketService.connect('INIT', '', [], user, function (response) {
                if (response.payload.success) {
                    user.isLoggedIn = true;
                    $localStorage.user = user;
                } else {
                    console.log('Error : Login failed');
                    reset();
                }

                callback($localStorage.user);
            });
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