angular.module('SimPlannerApp')
    .factory('socketService', function ($q, configService, sharedService) {
        var service = {};

        //  Returns a promise
        service.connect = function (call, verb, params, user, view) {
            var sckParams = [],
                jsonObject = {
                    agmt: '00001',
                    usr: null,
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

                    jsonObject.usr = config.UseDefaultSignIn === true ? config.DefaultSignIn.Username : user.username;

                    for (var i = 0; i < params.length; i++) {
                        sckParams.push(
                            sckParam(
                                params[i].name,
                                params[i].datatype,
                                params[i].value
                            )
                        );
                    }
                
                    if(view){
                        if (view.storedProcedure.get.tags) {
                            var tags = view.storedProcedure.get.tags;

                            for (var i = 0; i < tags.length; i++) {
                                sckParams.push(
                                    sckParam(
                                        tags[i].name,
                                        tags[i].datatype,
                                        tags[i].value
                                    )
                                );
                            }
                        }
                        
                        if(view.storedProcedure.get.parameters.qryusr){
                            sckParams.push(
                                sckParam(
                                    'qryusr',
                                    's',
                                    user.login
                                )
                            );
                        }
                        
                        if(view.storedProcedure.get.parameters.login){
                            sckParams.push(
                                sckParam(
                                    'login',
                                    's',
                                    user.login
                                )
                            );
                        }
                        
                        if(view.storedProcedure.get.parameters.pwd){
                            sckParams.push(
                                sckParam(
                                    'pwd',
                                    's',
                                    config.UseDefaultSignIn === true ? user.login : user.password
                                )
                            );
                        }
                    } else {
                        sckParams.push(
                            sckParam(
                                'login',
                                's',
                                user.login
                            )
                        );
                        sckParams.push(
                            sckParam(
                                'pwd',
                                's',
                                config.UseDefaultSignIn === true ? user.login : user.password
                            )
                        );
                    }
                
                    socket = new WebSocket(config.socketAddress);

                    socket.onopen = function () {
                        console.log('Socket is open');
                        //console.log('Sending : ', jsonObject);
                        socket.send(JSON.stringify(jsonObject));
                    };

                    socket.onmessage = function (response) {
                        console.log('\n' + new Date().toUTCString() + '\nServer responded');
                        console.log('connect data : ', response);

                        result.resolve(sanitize(JSON.parse(response.data).data[0]));
                    };

                    socket.onclose = function () {
                        socket.close;
                        console.log("Socket is closed");
                    };
                })
                .catch(function (error) {
                    result.reject(error);
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

            if (result.Datatype === 'D') {
                result.Value = '' + value.getFullYear() + '-' + ("0" + (value.getMonth() + 1)).slice(-2) + '-' + ("0" + value.getDate()).slice(-2);
            }

            return result;
        };

        function sanitize(data) {
            var result = [],
                iterations = data.Data.length === 0 ? 1 : data.Data.length;

            for (var i = 0; i < iterations; i++) {
                var item = new Object;

                for (var x = 0; x < data.Fields.length; x++) {
                    var field = data.Fields[x].toLowerCase(),
                        row = data.Data[i],
                        variableName;

                    variableName = sharedService.camelcase(field);

                    var a = variableName;
                    item[a] = row === undefined ? undefined : row[x];
                }

                result.push(item);
            }
            
            return result;
        };

        return service;
    });