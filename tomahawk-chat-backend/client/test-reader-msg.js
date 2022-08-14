/*Simple-test for message-transport chain*/
var client = require("./client.js");
var async  = require('async');

var userID="user02@tomahawk.chat";
var userPass="q123";
var ws = require("nodejs-websocket");
var conn;

var mongoHelper = require("../mongo/mongoHelper.js")

var fun_arr = [];

fun_arr.push(function (callback)
{
    client.Connect(userID, userPass, function (err)
    {
        if (err == null){
            console.log("Connected!");
            callback(err);
        }
        else{
            console.log("Connection error: " + JSON.stringify(err));
            callback(null);
        }   
    });
});

fun_arr.push(function(callback)
{
	setTimeout(function() {
		callback(null);
	}, 2000);
});


fun_arr.push(function (callback)
{
    mongoHelper.HelperReceivePacket(userID,function(err,data){
        var far=[];
        for(dt in data){
            far.push(function(dt, callback)
            {
                console.log("Delivering packet:",data[dt]._id);
                client.deliverMSG(data[dt]._id,function(err){
                    callback(err);
                })
            }.bind(null,dt));            
        }
        async.series(far, function(err)
        {
            if(err)
                cosole.log("Err:"+err);
            callback(err);
        });
    })
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
		//process.exit();
	}
});