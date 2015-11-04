angular.module('SimPlannerApp')
    .controller('welcomeController', ['$scope', 'sharedProperties', 'socketService', function ($scope, sharedProperties, socketService) {
        signOut();
        
        function signOut(){
            var user = sharedProperties.getUser();
            user.isLoggedIn = false;
            sharedProperties.setUser(user);
        }
        
        test();
        
        function test(){
            socketService.handshake({}, {}, function(reponse){
                var params = [];
                params.push({
                    name: 't0',
                    datatype: 'D',
                    value: '20110430'
                });
                
                params.push({
                    name: 't1',
                    datatype: 'D',
                    value: '20110501'
                });
                
                socketService.connect(sharedProperties.getConfig().views[0].storedProcedure.get.name, sharedProperties.getConfig().views[0].storedProcedure.get.verb, params, function (response) {
                    $scope.$apply(function () {
                        console.log('result : ', response);
                    });
                });
            });
        };
    }]);