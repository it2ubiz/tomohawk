const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log("Conected");
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        let body={
            "status" :"success",
            "result" :
            {
                "uploadToken" : "123-456-789",
                "downloadTokenList" :
                [
                    "123-456-111-11",
                    "234-567-987-00"
                ]
            }
        }
        ws.send(JSON.stringify(body));
    });
});