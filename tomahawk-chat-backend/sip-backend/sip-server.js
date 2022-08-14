const   express = require('express');
const   https   = require('https');
var config      = require('../config.js');

const   port = config.ServerPort;
const   server_ws = require("./sip-ws.js");
var     options={};

//createServer        
var app = express();
var server = app;
var expressWs = require('express-ws')(app);

console.log("[SIP Server] created at port: " + port);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

server_ws.Init(function (err) {
    if (err) {
        console.log('Server Init', err);
    }
});

app.get('/version', function (req, res) {
    res.send("SIP server middleware v0.1");
})


app.ws("/", function (conn, req) {    
    server_ws.HandleWebsocketConnection(conn, req);
});

server.listen(port);