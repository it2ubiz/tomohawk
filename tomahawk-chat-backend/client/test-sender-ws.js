const async         = require('async');
const WebSocket     = require('ws');
const config        = require("../config.js")

ws=new WebSocket(config.ServerURL);

var fun_arr = [];

ws.on('open', function open() {
    console.log("Message server connected");
    
    fun_arr.push(function (callback)
    {
        let request ={
            "request":
            {
                "method": "userLogin",
                "timestamp" : Date.now(),
                "requestID" : Math.floor(Math.random()*1000),
                "params":
                {
                    "password":"111",
                    "userID":"ZT5@tomahawk.chat"
                }
            }
        }
        ws.send(JSON.stringify(request));
        callback(null);
    });
    
    fun_arr.push(function(callback)
    {
        setTimeout(function() {
            callback(null);
        }, 2000);
    });
    
    
    fun_arr.push(function(callback){
        let msg={}
        let messages=[];
        for (i=0;i<5000;i++)
        {
            msg.destID="ZT6@tomahawk.chat";
            msg.chatID="ZT6";
            msg.body={            
                    "encrypted" : "this is text"
            };
            messages.push(msg);
        }
        
        let req={
            "request":
            {
                "method":"sendMessage",
                "timestamp" : Date.now(),        
                "requestID" : Math.floor(Math.random()*1000),        
                "params" :
                {
                    "messages" : messages
                }
            }
        }
        ws.send(JSON.stringify(req));
    })
    
    fun_arr.push(function(callback)
    {
        setTimeout(function() {
            callback(null);
        }, 2000);
    });
    
    
    fun_arr.push(function(callback){
        let msg={}
        let messages=[];
        var far=[];
        for (i=0;i<=15000;i++)
        {
            msg={};
            far.push(function(i, callback)
            {
                msg={};
                msg.destID="ZT6@tomahawk.chat";
                msg.chatID="ZT6";
                msg.body={            
                        "encrypted" : "this is text"
                };                
                let req={
                    "request":
                    {
                        "method":"sendMessage",
                        "timestamp" : Date.now(),        
                        "requestID" : Math.floor(Math.random()*1000),        
                        "params" :
                        {
                            "messages" : [msg]
                        }
                    }
                }
                ws.send(JSON.stringify(req));
                callback(null);
            }.bind(null,i));
        }
        async.series(far, function(err)
        {
            if(err)
                cosole.log("Err:"+err);
            callback(err);
        });
        //callback(null);
    });

    async.series(fun_arr, function(err)
    {
        if (err != null)
        {
            console.log("Test failed");
        }
        else
        {
            console.log("Test succeeded");
        }
    });
});

ws.on('message', function incoming(data) {
    let dta=JSON.parse(data)
    if (dta.result!=undefined)
        console.log(dta.result.method)
    else{
        if (dta.packet!=undefined)
            console.log("Packet id=",dta.packet.packetID);
            console.log("Messages count ",dta.packet.messages.length);
            let request = {
                "request":
                {
                    "timestamp" : Date.now(),
                    "requestID" : Math.floor(Math.random()*1000),
                    "method":"packetDelivered",
                    "params" :
                    {
                        "packetID" : dta.packet.packetID
                    }
                }
            };
            console.log("Sending packetDelivered for ",dta.packet.packetID);
            ws.send(JSON.stringify(request));
    }
    console.log("---");
});