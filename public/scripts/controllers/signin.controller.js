angular.module('SimPlannerApp')
    .controller('signinController', ['$scope', '$timeout', '$state', 'configService', 'userService', function ($scope, $timeout, $state, configService, userService) {
        $scope.pop = {
            error: {
                message: ''
            },
            hide: true,
            timeout: function () {
                $timeout(function () {
                    $scope.pop.hide = true;
                }, 10000);
            },
            showPop: function (message) {
                $scope.pop.hide = false;
                $scope.pop.error.message = message;
                $scope.pop.timeout();
            }
        };
        $scope.account = {
            login: ''
        };
        $scope.loading = false;
        var config;
        
        configService.getConfig()
            .then(function (response) {
                config = response.data;
            })
            .catch(function (error) {
                console.log('Error : ', error);
            });
        
        $scope.write = function(value){
            if(value === 'delete'){
                if($scope.account.login.length > 0){
                    $scope.account.login = $scope.account.login.substring(0, $scope.account.login.length - 1);
                }
            } else {
                $scope.account.login = $scope.account.login + value;
            }
        };
        
        $scope.signin = function(){
            $scope.loading = true;
            
            if($scope.account.login.length === 0){
                $scope.pop.showPop("Couldn't sign in due to missing username.");
            } else {
                userService.signIn($scope.account)
                    .then(function (response) {
                        if (response.isLoggedIn) {
                            $scope.account.login = '';

                            $state.go('menu');
                        }
                        $scope.loading = false;
                    })
                    .catch(function(error){
                        $scope.pop.showPop(error);
                        console.log(error);
                        $scope.loading = false;
                    });
            }
        };
    }]);