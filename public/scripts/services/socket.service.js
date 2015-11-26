angular.module('SimPlannerApp')
    .factory('socketService', function ($q, configService, sharedService) {
        var service = {};

        //  Returns a promise
        service.connect = function (call, verb, params, user, view) {
            var jsonObject = {
                    agmt: '00001',
                    usr: null,
                    request: call,
                    respond: guid(),
                    invoke: null,
                    payload: {
                        Verb: verb,
                        Parm: params
                    }
                },
                socket,
                result = $q.defer(),
                config;

            configService.getConfig()
                .then(function (response) {
                    config = response.data;

                    jsonObject.usr = config.UseDefaultSignIn === true ? config.DefaultSignIn.Username : user.username;
                
                    socket = new WebSocket(config.socketAddress);

                    socket.onopen = function () {
                        console.log('Socket is open');
                        console.log('Sending : ', jsonObject);
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