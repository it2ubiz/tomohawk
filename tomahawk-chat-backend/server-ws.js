const clientTable   = require("./client-table.js");
const msgTransport  = require("./msg-transport.js");
const EventEmitter  = require("events").EventEmitter;
const msgEventObject = new EventEmitter();
const async         = require('async');
const WebSocket     = require('ws');
const queue_lib     = require("./queue-manager.js")
const userClass     = require("./classes/User.js")
const mongoose      = require("mongoose");
const crypto        = require("crypto");

var config          = require('./config.js');
var outFormat       = require("./format.js");
var ws;
var Helpers         = require("./helpers.js");

var ChatClass         = require("./classes/Chats.js");
var classContactList  = require("./classes/ContactList.js");
var classDevice       = require("./classes/Devices.js");
var classToken        = require("./classes/Tokens.js");

var logger            = require("./logger/logger.js").get("ws");

exports.Init = function (callback) { 
    try{
        ws=new WebSocket(config.FileServerURL);    
    }
    catch(er){
        console.log("Error connectiong FileServer");
        return;
    }
    queue_lib.InitializeQueue().then(function () {
        callback();
    }).catch(function (err) {
        console.log("Error on init");
        callback();
    });
};

exports.HandleWebsocketConnection = function (conn, req) {
    let connItem = {};
    connItem.conn = conn;

    clientTable.Add(connItem);
    let record=null;    

    msgEventObject.on('tokenEvent', function(resp){        
        record = clientTable.GetRecord(conn);
        SendDataToSocket(record, resp);
    });
    
    ws.on('open', function open() {
        console.log("File-server conneted");
    });

    ws.on('message', function incoming(data) {
        msgEventObject.emit('tokenEvent', data);
    });    

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
    
    queue_lib.DeviceConnected(GUID,function(err,data){
        callback(err,data);
    });
    /*GetMessages(record.userID,function (status, body) {        
        callback(null,body);
    });*/
};

HandleOffline = function (conn, callback) {
    const record = clientTable.GetRecord(conn);    
    //logger.error('User if offline', {'meta': {'userID': record.userID}});
    queue_lib.DeviceDisconnected(record.userID).then(function (err) {
        callback(null, record.userID);
    }).catch(function (err) {
        console.log('[QueueEvent][DeviceDisconnected]', err);        
        callback(null, record.userID);
    });
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
            // connection was already removed
        }

        callback(err);
    });
}

const Execute = function (record, req, callback) {
    CheckAndCall(record, req, function (status, body) {
        let res = {};
        //res.method = req.method;
        //res.uri = req.uri;
        //res.status = status;
        //res.clientID = req.clientID;
        //logger.info("Sending data:",{'meta':{"data":body}});        
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
    if ((req.method === "register")||(req.method === "register_step2")) 
    {
        let step;
        var rec=clientTable.GetRecord(record.conn);
        if (req.method=="register")
        {
            step = 1;
            RegUser(step,rec,req,function(err,dt){
                /*if (dt!=null)
                {*/
                    if (err===null)
                        clientTable.SetConnProperty(record.conn,"userSalt",dt.userSalt)
                    let resp = outFormat.RegOutput(step,req,err,dt);
                    callback(resp.status,resp);
                /*}
                else
                    callback(null,null);*/
            })
        }
        else
        {
            step = 2;            
            RegUser(step,rec,req,function(err,dt){
                let resp = outFormat.RegOutput(step,req,err,dt);
                callback(resp.status,resp);
            });
        }
    }
    else
    {
        if (req.method === "userLogin") {
            AuthUser(record, req, function (status, body) { 
                callback(status, body);
                if (status === 200) {
                    //logger.info('User has been logined_INFO', {'meta': {'userID': record.userID}});
                    HandleOnline(record, function (err,dat) {
                        if (err != null) {
                            console.log("[" + record.userID + "] error on HandleOnline(): " + err);
                            record.conn.close();
                        }
                        else
                        {                        
                            callback(status,dat);
                        }
                    });
                }
            });        
        }
        else if (req.method==="fastLogin"){
            FastLogin(req,record,function(status,body){
                callback(status,body);
            })
        }
        else {               
            if (record.userID) {
                if (req.method === "sendMessage") {
                    SendMsg(req, record,function (status, body) {
                        callback(status, body);
                    });
                    //SendMsg(req,record,callback);
                }
                if (req.method === "packetDelivered"){
                    ConfirmDeliver(req, record,function (status, body) {
                        callback(status, body);
                    });
                }
                if (req.method === "getData"){                 
                    GetData(req, record,function (status, body) {
                        callback(status, body);
                    });
                }

                if (req.method === 'putData'){
                    PutData(req, record,function (status, body) {
                        callback(status, body);
                    });
                }
                if (req.method === "send_file"){
                    SendFile(req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                //Chat management system
                if (req.method === "create_chat"){
                    chat_type=1;
                    CreateChat(chat_type,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                if (req.method === "public_create"){
                    chat_type=2;
                    CreateChat(chat_type,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                if (req.method === "delete_chat"){
                    chat_type=1;
                    DeleteChat(chat_type,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                if (req.method === "public_delete"){
                    chat_type=2;
                    DeleteChat(chat_type,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                
                //Chat-user management
                if (req.method === "chat_user_add"){
                    let is_admin=false;
                    ChatAddUser(is_admin,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                
                if (req.method === "chat_user_delete"){
                    let is_admin=false;
                    ChatDelUser(is_admin,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }

                //Chat-admin management
                if (req.method === "chat_admin_add"){
                    let is_admin=true;
                    ChatAddUser(is_admin,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                
                if (req.method === "chat_admin_delete"){
                    let is_admin=true;
                    ChatDelUser(is_admin,req,record,function(status,body){                    
                        callback(status,body);
                    });
                }

                if (req.method === "get_chat_info"){                
                    ChatGetInfo(req,record,function(status,body){                    
                        callback(status,body);
                    });
                }
                
                if (req.method === "set_chat_info"){
                    ChatSetInfo(req,record,function(status,body){
                        callback(status,body);
                    });
                }

                if (req.method === "single_chat_create"){
                    chat_type=0;                
                    CreateChat(chat_type,req,record,function(status,body){
                        callback(status,body);
                    });
                }

                //Public messaging
                if (req.method === "sendPublic"){
                    PublicSend(req,record,function(status,body){
                        callback(status,body);
                    });
                }
                if (req.method === "getPublic"){
                    PublicGet(req,record,function(status,body){
                        callback(status,body);
                    });
                }

                if (req.method === "sendPrivate"){
                    PublicSend(req,record,function(status,body){
                        callback(status,body);
                    });
                }

                if (req.method === "sendSingle"){
                    PublicSend(req,record,function(status,body){
                        callback(status,body);
                    });
                }
                if (req.method==="get_public_contact_list"){
                    GetContactList(req,record,function(status,body){
                        callback(status,body);
                    })
                }
                if (req.method==="setDeviceToken"){
                    SetDeviceToken(req,record,function(status,body){
                        callback(status,body);
                    })
                }
                if (req.method==="logout"){
                    UserLogout(req,record,function(status,body){
                        callback(status,body);
                    })
                }
            }
        }
    }
};


AuthUser = function (record, req, callback) {
    
    let password = "";
    let userID = "";
    let userKey = "";
    let body = {};
    password=req.params.password;
    userID=req.params.userID;
    
    let deviceID=req.params.deviceID;
    let deviceType=req.params.deviceType
    let deviceToken=req.params.deviceToken;
    let pwd=crypto.createHash('sha512').update(password.toString()).digest("hex")
    userClass.getUserByUID(userID,function(err,dta)
    {
        if (dta!=null)
        {            
            if ((password != "")&&(userID!="")&&(dta.userPwd.toUpperCase()===pwd.toUpperCase())){
                // 
                let srv={};
                if (config.NoPacketDelivery===true)
                    srv.NoPacketDelivery=true
                let status=200;
                classDevice.UpdateDevice(userID,deviceType,deviceID,deviceToken,function(er,data){
                    let tresp=Helper_CreateClient(record, userID, deviceID,deviceType,deviceToken);
                    classToken.CreateToken(userID,function(err,tkn){
                        let usrToken = Helpers.EncryptToken(config.serverPublicKey,tkn);
                        body = {
                            "timestamp":Date.now(),
                            "method": req.method,
                            "requestID":req.requestID,
                            "status":"success",
                            "params":
                            {
                                "GUID":tresp.GUID,
                                "capabilities": {srv},
                                "token":usrToken
                            }
                        }
                        callback(status,body);
                    });
                })
            }
            else
            {
                let status=404;
                body ={
                    "timestamp":Date.now(),
                    "method": req.method,
                    "requestID":req.requestID,
                    "status":"auth_error",
                    "params":
                    {
                        "GUID":null
                    }
                }
                callback(status,body);
            }
        }
        else
        {
            let status=404;
            body ={
                "timestamp":Date.now(),
                "method": req.method,
                "requestID":req.requestID,
                "status":"auth_error",
                "params":
                {
                    "GUID":null
                }
            }
            callback(status,body);
        }
    
    });
}

Helper_CreateClient = function (record, userID, deviceID, deviceType,deviceToken) {
    var body = {};
    
    const GUID = Helpers.CreateGUID(userID);
    clientTable.SetConnProperty(record.conn, "userID", userID);
    clientTable.SetConnProperty(record.conn, "deviceID", deviceID);
    clientTable.SetConnProperty(record.conn, "deviceType", deviceType);
    clientTable.SetConnProperty(record.conn, "GUID", GUID);
    clientTable.SetConnProperty(record.conn, "deviceToken", deviceToken);

    body.GUID = GUID;

    return (body);
}


SendMsg = function (req, record, callback) {
    let body = {};
    let status = 403;        
    if (req.params.messages != null)
    {
        msgTransport.SendMessage(req.params.messages,record.userID,function(err,resp){
            let msgResp={};
            if (err==null){
                let msg_ids=[];
                for(rp in resp){
                    msg_ids.push(resp[rp]._id);
                }                
                msgResp=outFormat.SendMessageResp(req,msg_ids);
                /* Notification about new messages*/
                let fun_arr = []; 
                let msgList = req.params.messages;
                let mList=[];
                for (msg in req.params.messages)
                {
                    fun_arr.push(function (msg, callback) {
                       callback(null,msgList[msg].destID)
                    }.bind(null, msg));
                }
                async.parallel(fun_arr, function (err,dta) {
                    dta=DropDuplicates(dta);
                    for (msg in dta)
                    {
                        let queue_msg={
                            "type":"Message"
                        }
                        queue_lib.SendMessage(dta[msg], queue_msg).then(function()
                        {
                            //callback(null);
                        }).catch(function(err){
                            //callback(err);
                            console.log("SendMessage to queue error:",err);
                        });                        
                    }
                });
            }
            else
            {
                msgResp=outFormat.SendMessageRespErr(req,err);                
            }            
            callback(msgResp.status,msgResp);
        });
    }
};

DropDuplicates = function(ar){
    for (var q=1, i=1; q<ar.length; ++q){
        if (ar[q] !== ar[q-1]) {
            ar[i++] = ar[q];
        }
    }
    ar.length = i;
    return ar;
}

GetMessages = function (userID, callback) {
    if (userID!=null)
    {
        msgTransport.GetMessages(userID,function(err,data){
            callback(200,data);
        });
    }
}

ConfirmDeliver = function (req, record, callback) {
    let fun_arr=[]
    msgTransport.ConfirmDeliver(req.params.packetID,function(err,data){
        for (itm in data)
        {
            fun_arr.push(function (itm, callback) {
                if (data[itm].type==="text")
                {                    
                    msgTransport.SendStatus(data[itm]._id,data[itm].msgSender,"delivered",function(err,dta){
                        callback(null,dta.msgRcp);                        
                    });
                }
            }.bind(null, itm));
            
        }
        async.parallel(fun_arr, function (err,dta) {
            dta=DropDuplicates(dta);
            for (itm in dta)
            {
                let queue_msg={
                    "type":"Status"
                }
                queue_lib.SendMessage(dta[itm], queue_msg).then(function()
                {
                    //callback(200,{status:"success"});
                }).catch(function(err){
                    //callback(404,{status:err});
                });
            }            
        });
        let rsp_packet;
        if (data.length>0)
            rsp_packet=req.params.packetID;
        else
            rsp_packet=null        
        let response={
            /*"result":
            {*/
                "status":"success",
                "method" : "packetDelivered",
                "requestID":req.requestID,
                "timestamp":Date.now(),
                "params":
                {
                    "packetID":rsp_packet
                }
        //    }
        }
        callback(200,response);
    });
}

GetData = function (req, record, callback) {    
    userClass.GetUserBlob(record.userID,req,function(err,result){        
        if (err==null){
            var blobOutput=outFormat.getDataResponse(req,result);
            callback(blobOutput.status,blobOutput);
        }            
        else
        {
            var blobOutput=outFormat.getDataResponseError(req,err);            
            callback(blobOutput.status,blobOutput);
        }
    });
}

PutData = function (req, record, callback) {    
    userClass.SetUserBlob(record.userID,req,function(err,result){
        var blobOutput
        if (err==null){            
            blobOutput=outFormat.putDataBlob(req,result);            
            callback(blobOutput.status,blobOutput);
        }
        else
        {
            blobOutput=outFormat.putDataBlobErr(req,err);
            callback(blobOutput.status,blobOutput);
        }
    });
}

SendFile =function(req,record,callback){    
    let request=outFormat.TokenRequest(req.params.destList.length);
    ws.send(JSON.stringify(request));
    callback(200,{status:"pending"});
}

CreateChat = function(chat_type,req,record,callback){    
    ChatClass.CreateChat(record.userID,chat_type,req,function(er,dt){
        var resp;        
        if (chat_type==1)
            resp=outFormat.CreateChat(req,er,dt);
        if (chat_type==2)
            resp=outFormat.CreatePublic(req,er,dt);
        if (chat_type==0)
            resp=outFormat.CreateChat(req,er,dt);
        callback(resp.status,resp);
    });
}

DeleteChat = function(chat_type,req,record,callback){
    ChatClass.DeleteChat(record.userID,chat_type,req,function(er,dt){
        var resp;        
        if (chat_type==1)
            resp=outFormat.DeleteChat(req,er,dt);
        if (chat_type==2)
            resp=outFormat.DeletePublic(req,er,dt);
        callback(resp.status,resp);
    });
}

ChatAddUser = function(isadmin,req,record,callback){
    ChatClass.ChatAddUser(record.userID,isadmin,req,function(er,dt){
        let resp;
        if (isadmin!=true)
            resp=outFormat.ChatAddUser(req,er,dt);
        else
            resp=outFormat.ChatAddAdmin(req,er,dt);
        callback(resp.status,resp);
    });
}

ChatDelUser = function(isadmin,req,record,callback){
    ChatClass.ChatDeleteUser(record.userID,isadmin,req,function(er,dt){
        let resp;
        if (isadmin!=true)
            resp=outFormat.ChatDelUser(req,er,dt);
        else
            resp=outFormat.ChatDelAdmin(req,er,dt);
        callback(resp.status,resp);
    });
}

ChatGetInfo = function(req,record,callback){
    ChatClass.GetChatInfo(record.userID,req,function(er,dt){
        let resp = outFormat.ChatGetInfo(req,er,dt);
        callback(resp.status,resp);
    });
}


ChatSetInfo = function(req,record,callback){
    ChatClass.SetChatInfo(record.userID,req,function(er,dt){
        let resp=outFormat.ChatSetInfo(req,er,dt);
        callback(resp.status,resp);
    });
}


PublicSend = function(req,record,callback){
    msgTransport.SendPublic(req.params.messages,record.userID,function(err,dta){
        let msg_ids=[];
        for(rp in dta){
            msg_ids.push(dta[rp].messageID);
        }        
        var fun_arr=[];
        var rcp_list=[];
        for (dt in dta)
        {
            fun_arr.push(function (dt, callback) {
                let queue_msg={};
                ChatClass.getPublicChat(dta[dt].msgChat,function(err,rcp){
                    queue_msg={
                        "type":"PublicMessage",
                        "params":
                        {
                            "ChatID":dta[dt].msgChat
                        }
                    }
                    for (usr in rcp.chatParticipants.toObject())
                    {
                        queue_lib.SendMessage(rcp.chatParticipants[usr],queue_msg);
                    }
                    callback(null);
                })
             }.bind(null, dt));
        }        
        async.parallel(fun_arr, function (err) {
            let rst;            
            if (err==null)
                rst=outFormat.PublicResp(req,msg_ids);
            else
                rst=outFormat.PublicErr(req,msg_ids);
           callback(200,rst);
        });
    })
}

PublicGet = function(req,record,callback){
    msgTransport.GetPublic(record.userID,req.params.chatID,function(err,dta){
        /*
            for (msg in req.params.messages)
                {
                    fun_arr.push(function (msg, callback) {
                       callback(null,msgList[msg].destID)
                    }.bind(null, msg));
                }
                async.parallel(fun_arr, function (err,dta) {
                    dta=DropDuplicates(dta);                    
                    for (msg in dta)
                    {
                        queue_lib.SendMessage(msgList[msg].destID, "Message").then(function()
                        {
                            callback(null);
                        }).catch(function(err){
                            callback(err);
                        });                        
                    }
                });
        */
        /*let msg_ids=[];
        for(rp in dta){
            msg_ids.push(dta[rp]._id);
        }    
        let result=outFormat.GetPublicResp(req.requestID,msg_ids)
        callback(result.status,result.body);*/        
    })
}


PublicDelUser = function(isadmin,req,callback){

}

RegUser = function(step,record,req,callback){
    if (step==1)
    {
        userClass.RegUser(req,function(err,data){
            callback(err,data);
        });
    }
    if (step==2)
    {
        let qry={"userSalt":record.userSalt};
        let upd={"userPwd":req.params.passwordHash};
        userClass.UpdateUserAcc(qry,upd,function(er,dt){
            callback(er,dt);
        });
    }
}

GetContactList = function(req,record,callback){
    classContactList.getPublic(record.userID,function(err,data){
        let cts=[];
        let ct={}
        for (dt in data)
        {
            ct.contactID=data[dt].contactID;
            ct.contactName=data[dt].contactName;
            ct.contactAvatar=data[dt].contactAvatar;
            cts.push(ct);
        }
        let rst=outFormat.PublicContactList(req,null,cts);
        callback(err,rst);
    });
}

SetDeviceToken = function(req,record,callback){
    if ((req.params.deviceID!=null)&&(req.params.deviceToken))
    {
        classDevice.UpdateDevice(record.userID,record.deviceType,req.params.deviceID,req.params.deviceToken,function(er,dta){
            let rst={
                "timestamp" : Date.now(),
                "requestID" : req.requestID,
                "method"    : req.method,
                "status"    : "success",
                "params"    :
                {
                    "deviceID"    : dta.deviceID,
                    "deviceToken" : req.params.deviceToken
                }
            }
            callback(er,rst);
        });
    }
}

FastLogin = function(req,record,callback)
{
    if (req.params.token!=null)
    {
        let tkn = Helpers.DecryptToken(config.serverPublicKey,req.params.token);
        let jsonToken=JSON.parse(tkn);

        let deviceID=req.params.deviceID;
        let deviceToken=req.params.deviceToken;
        let deviceType=req.params.deviceToken;
        
        if ((jsonToken.tokenID!=null)&&(jsonToken.userID!=null))
        {
            classToken.FindToken(jsonToken.tokenID,jsonToken.userID,function(er,dt){
                let rst={};
                console.log("dt.length=0",dt.length===0);
                if (dt.length===0)
                {
                    rst={
                        "timestamp" : Date.now(),
                        "requestID" : req.requestID,
                        "method"    : req.method,
                        "status"    : "err_token"
                    }
                    callback(404,rst);
                }
                else
                {
                    rst={
                        "timestamp" : Date.now(),
                        "requestID" : req.requestID,
                        "method"    : req.method,
                        "status"    : "success",
                        "params"    :{
                            "userID":jsonToken.userID
                        }
                    }
                    let tresp=Helper_CreateClient(record, jsonToken.userID, deviceID,deviceType,deviceToken);
                    callback(er,rst);
                    HandleOnline(record, function (err,dat) {
                        if (err != null) {
                            console.log("[" + record.userID + "] error on HandleOnline(): " + err);
                            record.conn.close();
                        }
                        else
                        {                        
                            callback(200,dat);
                        }
                    });
                }
            });
        }
    }
}

UserLogout = function(req,record,callback){   
    HandleOffline(record.conn, function (err, userID) {
        if (err == null) {
            let rst={
                "timestamp" : Date.now(),
                "requestID" : req.requestID,
                "method"    : req.method,
                "status"    : "success",
                "params"    :{
                    "userID":userID
                }
            }
            classToken.delTokens(userID,function(er,dt){
                console.log("[" + userID + "] disconnect error = " + JSON.stringify(err));
                clientTable.Del(record.conn);
            });
        }
        else {
            console.log(err);
        }
        callback(err,rst);
    });
}