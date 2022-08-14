var async         = require('async');
var WebSocket     = require('ws');
var config        = require('../config.js');
//var logger        = require("../logger/logger.js").get("ws");
var clientTable   = require("../client-table.js");
var sipUser       = require ("./sip-user.js");

exports.Init = function (callback){
    console.log("Initialize of SIP-server middleware")
};

exports.HandleWebsocketConnection = function (conn, req) {
    let connItem = {};
    connItem.conn = conn;

    clientTable.Add(connItem);
    let record=null;

    conn.on("message", function (data) {        
        record = clientTable.GetRecord(conn);
        //console.log("clientTable is: ",record);
        if (record === null) {
            conn.close();
            return;
        }
        let parsedJSON = {};        
        try {
            parsedJSON =  Helpers.ParseInputJSON(data);
            //helper.ParseInputJSON(data);
            //JSON.parse(data);            
        }
        catch (ex) {
            console.log("[" + record.userID + "]" + " error parsing JSON");
            Helper_SendBadRequest(record);
            conn.close();
            return;
        } 

        if (parsedJSON.parsed.method === undefined) {
            console.log("[" + record.userID + "] error occurred: invalid parameters");
            Helper_SendBadRequest(record);
            conn.close();
            return;
        }
        else {
            console.log("[" + record.userID + "][" + parsedJSON.parsed.method + "]");
        }

        Execute(record, parsedJSON.parsed, function (dataToSend) {
            if (dataToSend!=={})
                SendDataToSocket(record, JSON.stringify(dataToSend));
        });        
    });

    conn.on("close", function (code, reason) {       
        CloseConnection(conn, code, reason, function (err) {
            console.log(err);
        });
    });
};

SendDataToSocket = function(record, data)
{
	var result = true;
	try
	{
		record.conn.send(data);
	}
	catch (ex)
	{
		console.log("Exception on send: " + ex);
		record.conn.close();
		result = false;
	}
	return (result);
}

HandleOnline = function (record, callback) {
    if (record.userID && record.userID == "" || record.userID == undefined) {
        console.log("UserID = empty");
        callback("Empty userID",null);
        return;
    }
    let GUID=record.userID;
};

HandleOffline = function (conn, callback) {
    const record = clientTable.GetRecord(conn);
};


Helper_SendBadRequest = function (record) {
    let reply = {};
    reply.status = 400;
    reply.error = {};
    SendDataToSocket(record, JSON.stringify(reply));
};

CloseConnection = function (conn, code, reason, callback) {
    HandleOffline(conn, function (err, userID) {
        if (err == null) {
            console.log("[" + userID + "] disconnect reason = " + JSON.stringify(reason) + ", error = " + JSON.stringify(err));
            clientTable.Del(conn);
        }
        else {
            console.log(err);
        }
        callback(err);
    });
}

const Execute = function (record, req, callback) {
    CheckAndCall(record, req, function (status, body) {
        let res = {};
        if ((body !== {})&&(body!==undefined)) {
            if (body.packet!=undefined)
                res = body
            else
                res.result = body;
        }
        callback(res);
    });
};

CheckAndCall = function (record, req, callback) {
    var rec=clientTable.GetRecord(record.conn);
    if (req.method === "createUser")
    {
        createUser(rec,req,function(err,dat){
            callback(err,resp);
        });
    }
    if (req.method==="updateUser")
    {
        updateUser(rec,req,function(err,dat){
            callback(err,resp);
        });
    }
    if (req.method==="deleteUser")
    {
        deleteUser(rec,req,function(err,dat){
            callback(err,resp);
        });
    }
};

createUser = function (req, record, callback) {
    sipUser.createUser(req,record,function(err,data){
        callback(err,data);
    })
}

updateUser = function (req, record, callback) {
    sipUser.deleteUser(req,record,function(err,data){
        callback(err,data);
    })
}

deleteUser = function (req, record, callback) {
    sipUser.deleteUser(req,record,function(err,data){
        callback(err,data);
    })
}