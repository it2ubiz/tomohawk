const async         = require('async');
const WebSocket     = require('ws');
const config        = require("../config.js")

ws=new WebSocket(config.ServerURL);


ws.on('open', function open() {
    console.log("Message server connected");
    let request ={
        "request":
        {
            "method": "userLogin",
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "params":
            {
                "password":"111",
                "userID":"ZT6@tomahawk.chat"
            }
        }
    }
    ws.send(JSON.stringify(request));
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