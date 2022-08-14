var ws = require("nodejs-websocket");

var nodeRSA = require('node-rsa');
var crypto = require("crypto");
var async = require("async");
var config = require('../config.js')
var helper = require ("../helpers.js");

var conn = null;

var userRecord = null;
var userID = null;
var key = [];
var publicKey = null;

var sendWS = function (conn, data, callback) {
    conn.sendText(JSON.stringify(data), function (err) {
        if (err) {
            console.log("Error on sending data: " + err);
            conn.close();
            conn = null;
        }
        callback(err);
    });
};

var generateKeyPair = function () {    
    let key = new nodeRSA({b: 2048});
    let publicKey = key.exportKey("public");
    return publicKey;    
};

exports.Connect = function (param_userID, pass, callback) {
    async.waterfall(
        [
            function (callback) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                conn = ws.connect(config.ServerURL, function (err) {
                    if (err) {
                        console.log("Error on connect: " + err);
                    }
                    ProcessLoginResult(null, conn);
                    callback(err);
                });
            }
        ],
        function (err) {
            if (err == null) {
                conn.on("text", function (str) {
                    console.log("Received structure: " + Helper_FormatStructureOutput(JSON.parse(str)), "", 0);
                    var parsed = JSON.parse(str);                   
                });
            }
            else {
                console.log("Error occurred");
            }
            callback(err);
        }        
    )
};


exports.authUser=function(user,pwd,dvcType,dvcID,dvcTkn,callback)
{
    var connInfo = {
        "request":
            {
                "method": "userLogin",
                "timestamp" : Date.now(),
                "requestID" : Math.floor(Math.random()*1000),
                "params":
                {
                    "password":pwd,
                    "userID":user,
                    "deviceType":dvcType,
                    "deviceID":dvcID,
                    "deviceToken":dvcTkn,
                    "random": helper.generateSalt(50)
                },
                "r_sign":publicKey
            }
        }

        sendWS(userRecord.conn, connInfo, function (err) {
            callback(err);
        });
}

exports.regUser = function (username,callback) {
    publicKey=generateKeyPair();
    var request = {
        "method":"register",
        "timestamp" : Date.now(),        
        "requestID" : Math.floor(Math.random()*1000),        
        "params" :
        {
            "version"  : "1",
            "publicKey": publicKey//,
            //"username" : username
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}


exports.regUser2Step = function (pwd,callback) {
    var request = {
        "method":"register_step2",
        "timestamp" : Date.now(),        
        "requestID" : Math.floor(Math.random()*1000),        
        "params" :
        {
            "passwordHash" : crypto.createHash('sha512').update(pwd.toString()).digest("hex")
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.sendMSG = function (callback) {
        var request =
            {
                "request":
                {
                    "method":"sendMessage",
                    "timestamp" : Date.now(),        
                    "requestID" : Math.floor(Math.random()*1000),        
                    "params" :
                    {
                        "messages" :
                        [
                            {
                                "destID" : "ZT6@tomahawk.chat",
                                "chatID" : "AxB",
                                "body" :
                                {
                                    "encrypted" : "this is text 1"
                                }
                            },
                            /*{
                                "destID" : "ZT7@tomahawk.chat",
                                "chatID" : "AxB",
                                "body" :
                                {
                                    "encrypted" : "this is text 1"
                                }
                            },*/
                            {
                                "destID" : "ZT7@tomahawk.chat",
                                "chatID" : "AxB",
                                "body" :
                                {
                                    "encrypted" : "this is text 1"
                                }
                            },
                            {
                                "destID" : "ZT8@tomahawk.chat",
                                "chatID" : "AxB",
                                "body" :
                                {
                                    "encrypted" : "this is text 1"
                                }
                            }
                        ]
                    }
                }
            };
        sendWS(userRecord.conn, request, function (err) {
            callback(err);
        });    
};

exports.getMSG = function (callback) {
    var request = {
        "method":"getMessages"
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.deliverMSG = function (packetID,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method":"packetDelivered",
            "params" :
            {
                "packetID" : packetID
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.sendFile = function(file_size, chatID, destList, callback){
    var request =
    {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "send_file",
            "params" :
            {
                "fileSize" : file_size,
                "destList" :['123','456','789'],
                "chatID" : chatID
            }
        }
    }
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.getBlob = function(accountID,cellType,cellIndex,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "getData",        
            "params" :
            {
                "accountID" : accountID,
                "cellType" :  cellType,
                "cellIndex" : cellIndex
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.setBlob = function(cellType,cellIndex,data,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "putData",
            "params" :
            {            
                "cellType" :  cellType,
                "cellIndex" : cellIndex,
                "data":data,
                "data_hash":crypto.createHash('md5').update(data).digest("hex")
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.CreateChat = function(participants,chatInfo,chatName,callback) {
    console.log([participants]);
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "create_chat",
            "params" :
            {            
                "participants" : participants,            
                "chatInfo"     : chatInfo,
                "chatName"     : chatName,
                "userListSign" : crypto.createHash('md5').update(chatInfo).digest("hex")
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.CreatePublic = function(participants,chatInfo,chatName,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "public_create",
            "params" :
            {            
                "participants" : participants,
                "chatInfo"     : chatInfo,
                "chatName"     : chatName,
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.DeleteChat = function(chatID,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "delete_chat",
            "params" :
            {
                "chatID":chatID
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.DeletePublic = function(chatID,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "public_delete",
            "params" :
            {
                "chatID":chatID
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.ChatAddUser = function(chatID,list,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "chat_user_add",
            "params" :
            {
                "chatID"    : chatID,
                "chatUsers" : list
                //"userListSign":<SIGN of user list>
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.ChatDelUser = function(chatID,list,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "chat_user_delete",
            "params" :
            {
                "chatID"    : chatID,
                "chatUsers" : list
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.ChatAddAdmin = function(chatID,list,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "chat_admin_add",
            "params" :
            {
                "chatID"    : chatID,
                "chatAdmins" : list
                //"userListSign":<SIGN of user list>
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.ChatDelAdmin = function(chatID,list,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "chat_admin_delete",
            "params" :
            {
                "chatID"    : chatID,
                "chatAdmins" : list
                //"userListSign":<SIGN of user list>
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.ChatDelUser  = function(chatID,list,callback) {
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "chat_user_delete",
            "params" :
            {
                "chatID"    : chatID,
                "chatUsers" : list
                //"userListSign":<SIGN of user list>
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.SetChatInfo  = function(chatID,chatInfo,chatName,callback){
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "set_chat_info",
            "params" :
            {
                "chatID"   : chatID,
                "chatName" : chatName,
                "chatInfo" : chatInfo
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.GetChatInfo  = function(chatID,callback){
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "get_chat_info",
            "params" :
            {
                "chatID" : chatID
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}


exports.CreateSingleChat  = function(userID,callback){
    var request = {
        "request":
        {
            "timestamp" : Date.now(),
            "requestID" : Math.floor(Math.random()*1000),
            "method" : "single_chat_create",
            "params" :
            {
                "userID" : userID
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.sendPublic = function (chatID,msgText,callback) {
    var request ={
    "request":
        {
            "method":"sendPublic",
            "timestamp" : Date.now(),        
            "requestID" : Math.floor(Math.random()*1000),        
            "params" :
            {
                "messages" :
                [
                    {
                        "chatID" :chatID,
                        "body" :
                        {
                            "encrypted" : msgText
                        }
                    }
                ]
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.getPublic = function (chatID,callback) {
    var request ={
    "request":
        {
            "method":"getPublic",
            "timestamp" : Date.now(),        
            "requestID" : Math.floor(Math.random()*1000),        
            "params" :
            {
                "chatID" :chatID,
                "pageID" :0
            }
        }
    };
    sendWS(userRecord.conn, request, function (err) {
        callback(err);
    }); 
}

exports.getContactList = function(callback)
{
    var request ={
        "request":
            {
                "method":"get_public_contact_list",
                "timestamp" : Date.now(),        
                "requestID" : Math.floor(Math.random()*1000),        
                "params" :{}
            }
        };
        sendWS(userRecord.conn, request, function (err) {
            callback(err);
        }); 
}


exports.updateToken = function(deviceID,deviceToken,callback)
{
    var request ={
        "request":
            {
                "method":"setDeviceToken",
                "timestamp" : Date.now(),        
                "requestID" : Math.floor(Math.random()*1000),        
                "params" :{
                    "deviceID":deviceID,
                    "deviceToken":deviceToken
                }
            }
        };
        sendWS(userRecord.conn, request, function (err) {
            callback(err);
        }); 
}


exports.fastLogin = function(callback)
{
    var request ={
        "request":
            {
                "method":"fastLogin",
                "timestamp" : Date.now(),
                "requestID" : Math.floor(Math.random()*1000),
                "params" :{
                    "token":config.clientToken
                }
            }
        };
        sendWS(userRecord.conn, request, function (err) {
            callback(err);
        }); 
}

exports.Logout = function(callback)
{
    var request ={
        "request":
            {
                "method":"logout",
                "timestamp" : Date.now(),
                "requestID" : Math.floor(Math.random()*1000),
                "params" :{}
            }
        };
        sendWS(userRecord.conn, request, function (err) {
            callback(err);
        }); 
}

// Helpers

Helper_FormatStructureOutput = function (obj, stack, num) {
    var output = "";

    for (var property in obj) {
        var current = "";
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                current = current + property + ":\n";
                current = current + Helper_FormatStructureOutput(obj[property], stack + '.' + property, num + 1);
            }
            else {
                current = current + property + " ===== " + obj[property] + "\n";
            }

            output = output + current;
        }
    }

    return (output);
};

ProcessLoginResult = function (parsed, conn) {
    ///if (parsed.status == 200) {
        // save connection information
        userRecord = {};
        userRecord.conn = conn;
        userRecord.queue = {};
        userRecord.queue.msgSent = [];
        userRecord.queue.msgAck = [];
        userRecord.history = [];
        userRecord.chats = [];
    /*}
    else {
        console.log("Error on server login");
        conn.close();
    }*/
};