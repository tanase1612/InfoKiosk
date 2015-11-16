angular.module('SimPlannerApp')
    .factory('socketService', function (configService, $q) {
        var service = {};
    
        //  Returns a promise
        service.connect = function (call, verb, params, user) {
             var sckParams = [],
                 jsonObject = {
                    agmt: '00001',
                    usr: null,
                    pwd: null,
                    login: null,
                    request: call,
                    respond: guid(),
                    invoke: null,
                    payload: {
                        Verb: verb,
                        Parm: sckParams
                    }
                 },
                 socket,
                 result = $q.defer(),
                 config;
            
            configService.getConfig()
                .then(function (response) {
                    config = response.data;
                
                    if(config.UseDefaultSignIn){
                        jsonObject.login = user.login;
                        jsonObject.usr = config.DefaultSignIn.Username;
                        jsonObject.pwd = config.DefaultSignIn.Password;
                    } else {
                        jsonObject.usr = user.username;
                        jsonObject.pwd = user.password;
                    }

                    for (var i = 0; i < params.length; i++) {
                        sckParams.push(
                            sckParam(
                                params[i].name, 
                                params[i].datatype, 
                                params[i].value
                            )
                        );
                    }

                    configService.getConfig()
                        .then(function(response){
                            socket = new WebSocket(response.data.socketAddress);

                            socket.onopen = function(){
                                console.log('Socket is open');
                                socket.send(JSON.stringify(jsonObject));
                            };

                            socket.onmessage = function (response) {
                                console.log('\n' + new Date().toUTCString() + '\nServer responded');
                                console.log('connect data : ', response);

                                result.resolve(JSON.parse(response.data));
                            };

                            socket.onclose = function () {
                                socket.close;
                                console.log("Socket is closed");
                            };
                        })
                        .catch(function(error){
                            result.reject('Error : ', error);
                        });
                })
                .catch(function (error) {
                    result.reject('Error : ', error);
                });
            
            return result.promise;
        };

        function guid() {
            var s = [],
                itoh = '0123456789ABCDEF';
            for (var i = 0; i < 36; i++)
                s[i] = Math.floor(Math.random() * 0x10);
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i < 36; i++)
                s[i] = itoh[s[i]];
            s[8] = s[13] = s[18] = s[23] = '-';
            return s.join('');
        };

        function sckParam(name, datatype, value) {
            var result = {
                Name: name,
                Datatype: datatype.toUpperCase(),
                Value: value
            };
            
            if(result.Datatype === 'D'){
                result.Value = '' + value.getFullYear() + '-' + ("0" + (value.getMonth() + 1)).slice(-2) + '-' + ("0" + value.getDate()).slice(-2);
            }
            
            return result;
        };

        return service;
    });