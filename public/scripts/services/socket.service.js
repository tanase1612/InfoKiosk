angular.module('SimPlannerApp')
    .factory('socketService', function () {
    var service = {};

    service.connect = function (call, callback) {
        var socket = new WebSocket(config.socketAddress), //  Connecting to socket server
            result,
            t0 = 20111031,
            t1 = 20111031,
            newID = guid(),
            SckParam = function (name, datatype, value) {
                this.Name = name;
                this.Datatype = datatype;
                this.Value = value;
            };
        
        socket.onopen = function () {
            console.log("Server is on!");
            
            socket.send(JSON.stringify({
                "request": call,
                "respond": newID,
                "invoke": null,
                "payload": {
                    "Verb": "rpEvListTime",
                    "Parm": [
                        new SckParam("t0", "D", t0),
                        new SckParam("t1", "D", t1)
                    ]
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
    return service;
});