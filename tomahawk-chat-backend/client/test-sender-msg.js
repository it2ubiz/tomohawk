/*Simple-test for message-transport chain*/
var client = require("./client.js");
var async  = require('async');

var userID="ZT5@tomahawk.chat";
var userPass="111";
var ws = require("nodejs-websocket");
var conn;

var fun_arr = [];

fun_arr.push(function (callback)
{
	client.Connect(userID, userPass, function (err)
	{
		if (err == null){
			console.log("Connected!");
		}
		else{
			console.log("Connection error: " + JSON.stringify(err));
		}
		callback(err);
	});
});

fun_arr.push(function(callback)
{
	setTimeout(function() {
		callback(null);
	}, 3000);
});

fun_arr.push(function (callback)
{
	client.authUser(userID, userPass, function (err)
	{
		if (err == null){
			console.log("Auth is OK!");
		}
		else{
			console.log("Auth error: " + JSON.stringify(err));
		}
		callback(err);
	});
});

fun_arr.push(function(callback)
{
	setTimeout(function() {
		callback(null);
	}, 3000);
});

fun_arr.push(function (callback)
{
	var far=[];
	for (i=0;i<=5000;i++)
	{
		far.push(function(i, callback)
		{                
			client.sendMSG(function (err) {
				callback(err);
			});
		}.bind(null,i));
	}
	async.series(far, function(err)
	{
		if(err)
			cosole.log("Err:"+err);
		callback(err);
	});
	///callback(null);
});

fun_arr.push(function(callback)
{
	setTimeout(function() {
		callback(null);
	}, 1000);
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