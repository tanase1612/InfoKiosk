'use strict';
angular.module('SimPlannerApp')
    .factory('sckServ', function () {
        var service = {};
function Socket( "ws://localhost:8081/Common" ){
    
	// @private
    this.buffer  = [];
    this.methods = {};
    this.schema  = undefined;
    var call     = this;
    // @private
    this.methods.onmessage = function( sckResp ){
        var response = sckResp.data;
        //var data = eval('(' + response + ')');
        var data = JSON.parse(response);
        
      
		var i = 0;
		call.buffer.forEach(function(value){
			if( value.id === data.callback )
			{
				if(value.parse === false){
					value.callback(data.data);
				}else{
					value.callback( call.parse(data.data) );
				}
				call.buffer.splice( i , 1 );
			}
			i++;
		});
        
    };
   // @public
   this.onopen  = false;
   // @public
   this.onerror = false;
   // @public
   this.onclose = false;
   // @private
    var call = this;
    if(Uri){
		try{
			this.sck = new WebSocket(String(Uri));
		}catch(e){
			this.sck = new WebSocket(Uri.toString());
		}
        this.sck.onopen = function( SckContext ){
            if( call.onopen ){
                call.onopen(SckContext);
            }
        }
        // @private
        this.sck.onerror = function( SckContext ){
            if( call.onerror ){
                call.onerror(SckContext);
            }
        }
        // @private
        this.sck.onclose = function( SckContext ){
            if( call.onclose ){
                call.onclose(SckContext);
            }
        }
        // @private
       this.sck.onmessage = function( SckContext ){
            if( call.methods.onmessage ){
                call.methods.onmessage(SckContext);
            }
        }
    }else{
        throw new SyntaxError("undefined connection string.");
    }
    
    return this;
}
    // @private
Socket.prototype.stream = function(ftag, fdat, frespond,invoke){
    var call = this;
    if ( 1 !== call.sck.readyState ){
        
		this.methods.onclose();
        
        
    } else {
        var newID = guid();
        call.buffer.push({id:newID, parse:true, callback:frespond});
		if(invoke === undefined){ invoke = null; }
        call.sck.send(JSON.stringify({
            "request":ftag,
            "respond":newID,
			"invoke": String(invoke),
            "payload":fdat
        }));
    }
};
    function Query(Socket,verb, parm){
    this.link = Socket;
    var app = '';
    if (this.link.schema !== undefined) { app = this.link.schema; };
    if (app.length > 0) { app += '.'; };
    if (typeof (verb) === "string") {
        this.rqst = {
            "Verb": app+verb,
            "Parm": parm
        };
    } else {
        var vl = verb.length;
        for (var i = 0; i < vl; i++) {
            var unit = verb[i];
            if (unit.Verb.toLowerCase() !== "spprsetage") {
                verb[i].Verb = app + verb[i].Verb;
            }
        }
        this.rqst = verb;
        parm = null;
    }
};


// @public
Query.prototype.then = function( frespond ){
    this.link.stream("CALL", this.rqst, frespond);
};
     var t0 = 20111031;
     var t1 = 20111031;
       
        
new Query(Socket, "rpEvListTime",
                      [new SckParam("t0","D", t0),
                       new SckParam("t1","D", t1)])
                .then(function(data){
                              service.CallData =data;
                              });
        return service;
    });

