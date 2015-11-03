angular.module('SimPlannerApp')
    .factory('socketService', function () {
        var service = {};

        service.connect = function (call, verb, params, callback) {
            var socket = new WebSocket(config.socketAddress), //  Connecting to socket server
                sckParams = [];

            for (var i = 0; i < params.length; i++) {
                sckParams.push(
                    sckParam(
                        params[i].name, 
                        params[i].datatype, 
                        params[i].value
                    )
                );
            }

            socket.onopen = function () {
                console.log("Server is on!");

                socket.send(JSON.stringify({
                    "request": call,
                    "respond": guid(),
                    "invoke": null,
                    "payload": {
                        "Verb": verb,
                        "Parm": sckParams
                    }
                }));
            };

            socket.onmessage = function (response) {
                console.log('\n' + new Date().toUTCString() + '\nServer responded');
                console.log('data : ', response);

                callback(JSON.parse(response.data));
            };

            socket.onclose = function () {
                socket.close;
                console.log("Socket is closed");
            };
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
                result.Value = '' + value.getFullYear() + ("0" + (value.getMonth() + 1)).slice(-2) + ("0" + value.getDate()).slice(-2);
            }
            
            console.log(result);
            
            return result;
        };

        return service;
    });