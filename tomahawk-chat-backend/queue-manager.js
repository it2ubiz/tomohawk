const amqp  = require('amqplib');
let channels = {};
let connection;
const msgTransport  = require("./msg-transport.js");
const config = require("./config.js");

exports.InitializeQueue = function () {
    //const connectionString="amqp://admin:Safe01@@b.maxtg.com:5672";
    const connectionString=config.mqULR;

    console.log('RabbitMQ: connect with', connectionString);
    return amqp.connect(connectionString).then(function (conn) {
        connection = conn;
        console.log('RabbitMQ connected');
    }, function (err) {
        console.error('RabbitMQ connect failed: %s', err);
        throw err;
    });
};

exports.SendMessage = function (msgRcp, messageJson) {
    if (connection)
    {
        //console.log("SendingMessage for ",msgRcp);
        //messageJson="Message for "+msgRcp;
        return connection.createChannel().then(function (ch) {            
            var queueName = msgRcp;
            var queue = ch.assertQueue(queueName, { durable: true });
            return queue.then(function() {
              //console.log("Queue",queueName);
              ch.sendToQueue(queueName, new Buffer(JSON.stringify(messageJson)), { persistent: true });
              ch.close();
            });
        });
    } else
    {
        return new Promise((success, reject) => reject('RabbitMQ: not connected'));
    }
};


exports.DeviceConnected = function (GUID,callback) {
    if (connection){
        console.log("DeviceConnected: ",GUID);
        return connection.createChannel().then(function (ch) {            
            var queueName = GUID;
            channels[GUID] = {channel: ch, msg: null};
            var queue = ch.assertQueue(queueName, { durable: true });
            return queue.then(function() {                
                return ch.consume(queueName, function (msg) {
                    channels[GUID].msg = msg;
                    let msg_type=JSON.parse(msg.content.toString());
                    if (msg_type.type==="PublicMessage")
                        msgTransport.GetPublic(GUID,msg_type.params.ChatID,function(err,data){
                            callback(err,data);
                        })
                        //(record.userID,req.params.chatID,function(err,dta){
                    if (msg_type.type==="event")
                    {
                        msgTransport.SendEvent(GUID,msg_type.params,function(err,data){
                            callback(err,data);
                        })
                    }
                    else{                        
                        msgTransport.GetMessages(GUID,function(err,data){
                            callback(err,data);
                        });
                    }
                },{noAck: true});            
            });
        });
    }
    else
    {
        console.log("RabbitMQ is not connected");
    }
};


exports.DeviceDisconnected = function (GUID) {
    if (connection)
    {
        return new Promise(function (success, reject) {
            try
            {
                // delete consumer
                console.log("CHANEl[GUID]=",channels);
                console.log("GUID=",GUID);
                
                if (channels[GUID] != null && channels[GUID].channel != null)
                {
                    console.log("CLOSING");
                    channels[GUID].channel.close().then(function() {
                        delete channels[GUID];
                        console.log('GUID %s closed the channel', GUID);
                    }).finally(function() { success(); });
                } else
                {
                    reject();
                }
            } catch (err) {
                reject();
                ('RabbitMQ can\'t cancel channel, GUID: %s is wrong: %s', GUID, err);
            }

        });
    }
    return new Promise(function (success, reject) {
        reject();
    });
};