var helper          = require('../helpers.js');
const async         = require('async');
const fs    = require('fs');
const apns  = require('node_apns');
var gcm = require('node-gcm');

var Notification = apns.Notification;
var Push = apns.Push;
var Device = apns.Device;

// TO DO - Need to add correct cers for iOS push
const cert_and_key={};
const cert_dev_key={};
const cert_prod_key={};

exports.SendPush = function (message, token,platform,callback) {
        const pushMessage = message;
        var isdebug=false;
        if (platform === config.deviceTypes.IOS || platform === config.deviceTypes.IOS_VOIP
        || platform === config.deviceTypes.IOS_DEBUG || platform === config.deviceTypes.IOS_MP) 
        {
            if (platform === config.deviceTypes.IOS_DEBUG)
                isdebug=true;
            SendAPNSPush(token,pushMessage,isdebug,function (err){
                callback(err);
            });                    
        }
        else
        {
            if (platform === config.deviceTypes.ANDROID || platform === config.deviceTypes.ANDROID_MP){
                SendGCMPush(token,pushMessage,function(err){
                    callback(err);
                })
            }
            else
            {
                console.error("PUSH to UNKNOWN platform");
                callback(null);
            }
        }
};


SendAPNSPush = function SendAPNSPush(token,message,isdebug,callback)
{
  
  if (isdebug)
    cert_and_key=cert_dev_key
  else
    cert_and_key=cert_prod_key

  var notifier = apns.services.Notifier({ cert: cert_and_key, key: cert_and_key }, isdebug /* development = true, production = false */);  
  console.log("iOS gateway is sandbox:",isdebug);  

  let payload = {aps: {alert: "MESSAGE_PUSH","content-available":1}};

  notifier.notify(Notification(token, payload), 
    function (err) {
      callback(err);
    });
}


SendGCMPush = function(token,msg,callback){
    /*Server key
    AAAAfMrO5m0:APA91bFUK6mxHzIxg4e3E3ae-m7VrEv5HrjswVZjMX9SF3zz59Sdn2tBIf3Ls1zM1tFquOJjdE2_x721PVIPnMvjlnX9YcifIB4OHuS8TXKvY3Jn31meurD8BI6mL51W0olqMA-nKnBgi6TydmU6M9iTFGShGuNdrg
    Legacy server key
    AIzaSyDxtGha2DtsVRLH-_WW-oFBGHyRtw2JEgE*/
    var sender = new gcm.Sender('AIzaSyDxtGha2DtsVRLH-_WW-oFBGHyRtw2JEgE'); //API Key 
    var registrationTokens = [];
    registrationTokens.push(token);
    let message = new gcm.Message(
    {
        priority: "high",
        data: {message: "PUSH_TEXT"},
        notification: {
            message:"PUSH_TEXT"
        }
    });
    sender.send(message, 
        {registrationTokens: registrationTokens}, 
        function (err, response) {
            callback(err);
        }
    );
}
