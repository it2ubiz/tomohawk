var mongoose        = require('mongoose');
const mongoModels   = require('./mongo/mongoModels.js');
const async         = require('async');
const config        = require('./config.js');
const helper        = require('./helpers.js');
const format        =require('./format.js');

//var ModelMessage = mongoose.model('msgQueue', mongoModels.model_Msg);
//mongoose.connect('mongodb://localhost:27017/msgstore', { promiseLibrary: global.Promise });

mongoose.connect(config.mongoDBUrl, { promiseLibrary: global.Promise });

var ModelMessage=mongoModels.ModelMessage;
var ModelPublicMsg=mongoModels.ModelPublicMsg;

exports.SendMessage = function(msglist,senderID,callback){
    mNum=msglist.length;
    var fun_arr = [];    
    for (mg in msglist)
    {
        fun_arr.push(function (mg, callback) {
            let msg         = new ModelMessage();
            msg.msgSender   = senderID;
            msg.msgRcp      = msglist[mg].destID;
            msg.msgBody     = msglist[mg].body.encrypted;
            msg.msgChat     = msglist[mg].chatID;
            msg.type        = "text";
            msg.packetID    = 0;
            //msg.messageID   = helper.CreateChatID(senderID,msglist[mg].chatID);
            msg.save(function(err,data){
                callback(err,data);
            });
        }.bind(null, mg));
    }    
    async.parallel(fun_arr, function (err,data) {
        callback(err,data);
    });
}

exports.GetMessages=function(userID,callback){
    let packetID=Math.floor(Math.random()*1000);
    ModelMessage.update({msgRcp: userID,packetID:0},{packetID:packetID}, {multi:true}, function (err,dt) {
        if (err==null){
            if (dt.n>0){
                ModelMessage.find({msgRcp: userID,packetID:packetID}, function (err,data) {
                    var fun_arr = [];
                    let body;
                    console.log("MsgData is:", data);
                    for (dat in data){
                        let msg_item={};
                        msg_item.messageParams={};

                        fun_arr.push(function (dat, callback) {
                            if (data[dat].type==="text"){
                                msg_item.messageID=data[dat]._id;
                                //msg_item.messageID=data[dat].messageID; // added
                                msg_item.type="text";                                
                                msg_item.messageParams.senderID=data[dat].msgSender;
                                msg_item.messageParams.chatID=data[dat].msgChat;
                                msg_item.messageParams.body=data[dat].msgBody;
                                callback(err,msg_item)
                            }
                            else if (data[dat].type==="status")
                            {
                                msg_item.type="status";
                                msg_item.messageParams.status=data[dat].status;
                                msg_item.messageID=data[dat].messageID;
                                callback(err,msg_item)
                            }                        
                        }.bind(null, dat));
                    }
                    async.parallel(fun_arr, function (err,itm) {
                        body={
                            "packet":{
                                "timestamp" : Date.now(),
                                "packetID"  : packetID,
                                //"method"    : "getMessages",
                                "messages"  : itm
                            }
                        };       
                        callback(err,body);
                    });
                });
            }
            else
            {
                return;              
                callback(null,null);
            }
        }
        else
            callback(err,null);
    });
}


exports.ConfirmDeliver=function(packetID,callback){
    ModelMessage.find({packetID: packetID}, function (err, data) {
        ModelMessage.remove({packetID:packetID},function(err){
            callback(err,data);
        })
    });
}

exports.SendStatus=function(msgID,rcpID,status,callback){
    /*ModelMessage.findOneAndUpdate(
        {messageID:msgID},{msgRcp:rcpID,type:"status",status:status},{"upsert":true},
        function(err,data){
            console.log(data);
            callback(err,data);
    })*/
    let msg         = new ModelMessage();    
    msg.msgRcp      = rcpID;
    msg.type        = "status";
    msg.status      = status;
    msg.messageID   = msgID;
    msg.packetID    = 0;
    msg.save(function(err,data){                
        callback(err,data);
    });
}

exports.SendPublic = function(msglist,senderID,callback){
    mNum=msglist.length;
    var fun_arr = [];    
    //{ $orderby : { 'created_at' : -1 } }
    for (mg in msglist)
    {
        fun_arr.push(function (mg, callback) {
            let msg          = new ModelPublicMsg();
            msg.msgSender    = senderID;
            msg.msgBody      = msglist[mg].body.encrypted;
            msg.msgChat      = msglist[mg].chatID;
            msg.type         = "text";
            msg.messageID    = helper.CreateMessageGUID(senderID,msglist[mg].chatID);
            msg.msgTimeStamp = Date.now();
            msg.save(function(err,data){
                callback(err,data);
            });
        }.bind(null, mg));
    }    
    async.parallel(fun_arr, function (err,data) {
        callback(err,data);
    });
}

exports.GetPublic = function(userID,chatID,callback){
    console.log("userID",userID,"chatID",chatID);
    let packetID=Math.floor(Math.random()*1000);
    if (chatID!=null)
    {
        mongoModels.ModelChatUserMsg.findOne({'chatID':chatID,"userID":userID},function(err,dta){
            var msgID=0;            
            if (dta!=null)
                msgID=dta.msgID;
            console.log(msgID);
            //let options = { sort: { id: 1 }, limit: 0, skip: 0 };            
            mongoModels.ModelPublicMsg.find({"msgChat":chatID,"msgNumber":{$gt:msgID}},null,{sort:{'msgNumber':-1}},function(err,rslt){                
                if (rslt!=null)
                    mongoModels.ModelChatUserMsg.findOneAndUpdate({"userID":userID,"chatID":chatID},
                    {"msgID":rslt[0].msgNumber,"msgTimeStamp":rslt[0].msgTimeStamp},{upsert:true},function(er,upd){

                        //START
                        //callback(er,rslt);
                        var fun_arr=[];
                        for (dat in rslt){
                            let msg_item={};
                            msg_item.messageParams={};
    
                            fun_arr.push(function (dat, callback) {
                                //if (data[dat].type==="text"){
                                    msg_item.messageID=rslt[dat]._id;
                                    //msg_item.messageID=data[dat].messageID; // added
                                    //msg_item.type="text";                                
                                    msg_item.messageParams.senderID=rslt[dat].msgSender;
                                    msg_item.messageParams.chatID=rslt[dat].msgChat;
                                    msg_item.messageParams.body=rslt[dat].msgBody;
                                    callback(err,msg_item)
                                //}
                                /*else if (data[dat].type==="status")
                                {
                                    msg_item.type="status";
                                    msg_item.messageParams.status=data[dat].status;
                                    msg_item.messageID=data[dat].messageID;
                                    callback(err,msg_item)
                                }*/                        
                            }.bind(null, dat));
                        }
                        async.parallel(fun_arr, function (err,itm) {
                            body={
                                "packet":{
                                    "timestamp" : Date.now(),
                                    "packetID"  : packetID,
                                    //"method"    : "getMessages",
                                    "messages"  : itm
                                }
                            };       
                            callback(err,body);
                        });
                        //END

                    })
                else
                    callback(null,null);
            });
        })
    }
}

exports.SendEvent=function(userID,params,callback){
    let packetID=Math.floor(Math.random()*1000);
    let mitems ={};
    let resp={};
    if ((params.action!=="chat_add")&&(params.action!=="chat_del"))
    {
        mitems ={
            "messageID":Math.floor(Math.random()*1000),
            "type" :"event",
            "messageParams":
            {
                "chatID":params.chatID,
                "event_type":params.action,
                "body":{
                    "users":params.users
                }
            }
        }    
        resp = {
            "packet":{
                "timestamp" : Date.now(),
                "packetID"  : packetID,
                "messages"  : [mitems]
            }
        }
        callback(null,resp);
    }
    else
    {
        if (params.action==="chat_add")
        {
            console.log("CHAT_ADD event is called");
            if (params.admin==true)
            {
                mitems = {
                    "messageID":Math.floor(Math.random()*1000),
                    "type" :"event",
                    "messageParams":
                    {
                        "chatID":params.chatID,
                        "event_type":params.action,
                        "body":{
                            "chatParticipants" : [],
                            "chatAdmins" : [],
                            "type" : null,
                            "chatInfo" : null,
                            "chatName" : null,
                            "chatID" : null,
                        },
                        "admin":true
                    }
                }
                resp = {
                    "packet":{
                        "timestamp" : Date.now(),
                        "packetID"  : packetID,
                        "messages"  : [mitems]
                    }
                }
                callback(null,resp);
            }
            else
            {
                mongoModels.ModelChat.findOne({"chatID":params.chatID},function(err,data){
                    //console.log("DATA ",data);
                    if (data!=null)
                    {
                        let dt=format.ChatFormat(data);
                        mitems = {
                            "messageID":Math.floor(Math.random()*1000),
                            "type" :"event",
                            "messageParams":
                            {
                                "chatID":params.chatID,
                                "event_type":params.action,
                                "body":dt,
                                "admin":false
                            }
                        }
                        resp = {
                            "packet":{
                                "timestamp" : Date.now(),
                                "packetID"  : packetID,
                                "messages"  : [mitems]
                            }
                        }
                        callback(null,resp);
                    }
                })
            }
        }
        if (params.action==="chat_del")
        {
            console.log("Chat delete action is called");
            mitems = {
                "messageID":Math.floor(Math.random()*1000),
                "type" :"event",
                "messageParams":
                {
                    "chatID":params.chatID,
                    "event_type":params.action,
                    "admin":params.admin
                }
            }
            resp = {
                "packet":{
                    "timestamp" : Date.now(),
                    "packetID"  : packetID,
                    "messages"  : [mitems]
                }
            }
            callback(null,resp);
        }
    }
}