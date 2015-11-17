angular.module('SimPlannerApp')
    .factory('socketService', function (configService, $q) {
        var service = {};

        //  Returns a promise
        service.connect = function (call, verb, params, user) {
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

                    params.push({
                        name: 'login',
                        datatype: 's',
                        value: config.UseDefaultSignIn === true ? user.login : ''
                    });
                    params.push({
                        name: 'pwd',
                        datatype: 's',
                        value: config.UseDefaultSignIn === true ? config.DefaultSignIn.Password : user.password
                    });

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

                    socket = new WebSocket(config.socketAddress);

                    socket.onopen = function () {
                        console.log('Socket is open');
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

                    variableName = camelcase(field);

                    var a = variableName;
                    item[a] = row === undefined ? undefined : row[x];
                }

                result.push(item);
            }
            
            return result;
        };

        function camelcase(text) {
            var result = '',
                nextToUpper = false,
                char;

            for (var i = 0; i < text.length; i++) {
                char = text.charAt(i);

                if (char === '.') {
                    nextToUpper = true;
                } else {
                    result += nextToUpper ? char.toUpperCase() : char.toLowerCase();
                    nextToUpper = false;
                }
            }

            return result;
        }

        return service;
    });