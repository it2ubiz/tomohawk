var mongoModel      = require('../mongo/mongoModels.js');
var helper          = require('../helpers.js');
var queuelib        = require('../queue-manager.js');
const async         = require('async');

var ModelChat        = mongoModel.ModelChat;
var ModelChatUserMsg = mongoModel.ModelChatUserMsg;

CreateChat = function(userID,type,req,callback)
{
    let chAr;
    switch (type){
        case 0:     // Chat 1x1            
            var chatItem=new ModelChat();
            chatItem.type="single";
            chatItem.chatID=helper.CreateSingleChatID(userID,req.params.userID);
            chatItem.chatParticipants.push(req.params.userID);
            chatItem.chatParticipants.push(userID);
            
            chAr=chatItem.chatParticipants.toObject();
            chatItem.save(function(err,data){
                //callback(err,data);
                let mqueue={
                    "type":"event",
                    "params":
                    {
                        "chatID":data.chatID,
                        "action":"chat_add"
                    }
                }
                let fs_arr=[];                
                console.log("Added user->",chAr);
                for (us in chAr){
                    fs_arr.push(function (us, callback) {
                        queuelib.SendMessage(chAr[us], mqueue).then(function()
                        {
                            callback(null,null);
                        }).catch(function(err){
                            console.log("Error sending CHAT_ADD event ",err," for rcp -> ",chAr[us]);
                            callback(err,null);
                        });
                    }.bind(null, us));
                }
                async.parallel(fs_arr, function (err,itm) {
                    callback(err,data);
                });
            })
            break;
        case 1:     //Chat private
            var chatItem=new ModelChat();
            chatItem.type="private";
            if (req.params.chatInfo!=null)
                chatItem.chatInfo=req.params.chatInfo
            if (req.params.chatName!=null)
                chatItem.chatName=req.params.chatName
            if ((req.params.participants!=null)&&(req.params.participants.length>0))
            {
                let chatParticipants=[];
                for (user in req.params.participants){                    
                    chatParticipants.push(req.params.participants[user]);
                }
                chatItem.chatParticipants=chatParticipants;
                chatItem.userListSign=req.params.userListSign
            }
            chatItem.chatAdmins=[];
            chatItem.chatAdmins.push(userID);
            
            chAr=chatItem.chatParticipants.toObject();
            
            chatItem.chatParticipants.push(userID);
            chatItem.chatID=helper.CreateChatID(userID,"tomahawk.chat");
            chatItem.save(function(err,data){
                let mqueue={
                    "type":"event",
                    "params":
                    {
                        "chatID":data.chatID,
                        "action":"chat_add"
                    }
                }
                let fs_arr=[];                
                console.log("Added user->",chAr);
                for (us in chAr){
                    fs_arr.push(function (us, callback) {
                        queuelib.SendMessage(chAr[us], mqueue).then(function()
                        {
                            callback(null,null);
                        }).catch(function(err){
                            console.log("Error sending CHAT_ADD event ",err," for rcp -> ",chAr[us]);
                            callback(err,null);
                        });
                    }.bind(null, us));
                }
                async.parallel(fs_arr, function (err,itm) {
                    callback(err,data);
                });
            })
            break;
        case 2:     //Chat public
            var chatItem=new ModelChat();
            chatItem.type="public";
            if (req.params.chatInfo!=null)
                chatItem.ChatInfo=req.params.chatInfo
            if (req.params.chatName!=null)
                chatItem.chatName=req.params.chatName
            if (req.params.chatInfo!=null)
                chatItem.chatLink=req.params.chatLink
            if ((req.params.participants!=null)&&(req.params.participants.length>0))
            {
                chatItem.chatParticipants=[];
                for (user in req.params.participants){
                    chatItem.chatParticipants.push( req.params.participants[user]);
                }
                chatItem.userListSign=req.params.userListSign
            }
            chatItem.chatAdmins=[];
            chatItem.chatAdmins.push(userID);
            
            chAr=chatItem.chatParticipants.toObject();

            chatItem.chatParticipants.push(userID);
            chatItem.chatID=helper.CreateChatID(userID,"tomahawk.chat");
            chatItem.save(function(err,data){
                let mqueue={
                    "type":"event",
                    "params":
                    {
                        "chatID":data.chatID,
                        "users":data.chatParticipants,
                        "action":"chat_add"
                    }
                }
                let fs_arr=[];                
                for (us in chAr){
                    fs_arr.push(function (us, callback) {
                        queuelib.SendMessage(chAr[us], mqueue).then(function()
                        {
                            callback(null,null);
                        }).catch(function(err){
                            console.log("Error sending CHAT_ADD event ",err," for rcp -> ",chAr[us]);
                            callback(err,null);
                        });
                    }.bind(null, us));
                }
                async.parallel(fs_arr, function (err,itm) {
                    callback(err,data);
                });
                //callback(err,data);
            })
            break;
    }
}

DeleteChat = function(userID,type,req,callback)
{
    switch (type){
        case 1://Chat private
        case 2://Chat public            
            ModelChat.findOne({"chatID":req.params.chatID},function(err,data){
                if ((err==null)&&(data!=null))
                {
                    if (helper.inArray(userID,data.chatAdmins,true)==true)
                    {
                        ModelChat.remove({"chatID":req.params.chatID},function(err){
                            if (err!=null)
                                callback(err,null);
                            else
                                callback(null,req.params.chatID);
                        })
                    }
                    else
                        callback("error_auth",null);
                }
                else
                    callback(err,null);
            });
            break;
    }
}

ChatAddPublic = function(userID,req,callback)
{
    //Allow only to add user him-self into the public chat
    ModelChat.findOne({"chatID":req.params.publicID},function(err,dat){
        if ((userID===req.params.addUser)&&(data!=null)&&(dat.type!='single'))
        {
            var chatItem=dat;
            var partArr=dat.chatParticipants;
            if (helper.inArray(userID,data.chatParticipants,true)==false)
            {
                partArr.push(req.params.userID);
                chatItem.participants=partArr;
                chatItem.save(function(err,dat){
                    callback(err,dat);
                })
            }
            else
                callback("error_user",null); // Means that user has already been added
        }
    });
}

ChatLeavePublic = function(userID,req,callback)
{
    //Allow user to remove himself from the public chat
    if (userID==req.params.delUser){
        ModelChat.findOne({"chatID":req.params.publicID},function(err,dat){
            if ((userID===req.params.addUser)&&(dat!=null)&&(dat.type!='single'))
            {
                var chatItem=dat;
                var partArr=data.chatParticipants;
                if (helper.inArray(userID,data.chatParticipants,true)==true)
                {
                    partArr.splice(partArr.indexOf(userID), 1);
                    chatItem.participants=partArr;
                    chatItem.save(function(err,dat){
                        callback(err,dat);
                    })
                }
                else
                    callback("error_user",null); // Means that there is no such user in chat
            }
        });
    }
    else
    {
        callback("error_auth",null);
    }
    
}

ChatAddUser = function(userID,isadmin,req,callback)
{
    ModelChat.findOne({"chatID":req.params.chatID},function(err,data){
        let dt=data.type!=='single';
        if ((err==null)&&(data!=null)&&(dt==true))
        {
            var itmChat=data;
            var errFlag=false;
            let msg_queue={};
            if (helper.inArray(userID,data.chatAdmins,true)==true)
            {
                let adArr=[];
                let rcpArr=itmChat.chatParticipants.toObject();
                if (isadmin==true) // Adding admin user into the chat
                {
                    adArr=[];
                    for (usr in req.params.chatAdmins)
                    {
                        if (helper.inArray(req.params.chatAdmins[usr],data.chatParticipants,true)==false)
                        {
                            errFlag=true;
                            break;
                        }
                        else{
                            if (helper.inArray(req.params.chatAdmins[usr],itmChat.chatAdmins,true)==false)
                                itmChat.chatAdmins.push(req.params.chatAdmins[usr]);
                                adArr.push(req.params.chatAdmins[usr]);
                        }
                    }
                    if (!errFlag)
                    {
                        msg_queue={
                            "type":"event",
                            "params":
                            {
                                "chatID":req.params.chatID,
                                "users":adArr,
                                "action":"chat_admin_add"
                            }
                        }
                        itmChat.save(function(err,data){
                            if (adArr.length>0)
                            {
                                let f_arr=[];
                                for (usr in rcpArr){                           
                                    console.log("Sending event to [",rcpArr[usr],"]->[",req.params.chatID,"]");
                                    f_arr.push(function (usr, callback) {
                                        queuelib.SendMessage(rcpArr[usr], msg_queue).then(function()
                                        {
                                            callback(null,null);
                                        }).catch(function(err){
                                            callback(err,null);
                                        });
                                    }.bind(null, usr));
                                }
                                async.parallel(f_arr, function (err,itm) {
                                    //callback(err,adArr);
                                    let mqueue={
                                        "type":"event",
                                        "params":
                                        {
                                            "chatID":req.params.chatID,
                                            "action":"chat_add",
                                            "admin":true
                                        }
                                    }
                                    let fs_arr=[];
                                    for (us in adArr){
                                        fs_arr.push(function (us, callback) {
                                            queuelib.SendMessage(adArr[us], mqueue).then(function()
                                            {
                                                callback(null,null);
                                            }).catch(function(err){
                                                console.log("Error sending CHAT_ADD event ",err," for rcp -> ",adArr[us]);
                                                callback(err,null);
                                            });
                                        }.bind(null, us));
                                    }
                                    async.parallel(fs_arr, function (err,itm) {
                                        callback(err,req.params.chatAdmins);
                                    });
                                });
                            }
                            //callback(err,req.params.chatAdmins);
                        });
                    }
                    else
                        callback("error_user",null);
                }
                else //Adding simple user into the chat
                {
                    adArr=[];
                    for (usr in req.params.chatUsers)
                    {
                        if (helper.inArray(req.params.chatUsers[usr],itmChat.chatParticipants,true)==false)
                        {
                            itmChat.chatParticipants.push(req.params.chatUsers[usr]);
                            adArr.push(req.params.chatUsers[usr]);
                        }
                    }                    
                    itmChat.save(function(err,data){
                        let msg_queue={
                            "type":"event",
                            "params":
                            {
                                "chatID":req.params.chatID,
                                "users":adArr,
                                "action":"chat_user_add"
                            }
                        }                    
                        //sending event to all chat participants to inform that new user was added
                        if (adArr.length>0)
                        {
                            let f_arr=[];
                            for (usr in rcpArr){
                                console.log("Sending event to [",rcpArr[usr],"]->[",req.params.chatID,"]");
                                f_arr.push(function (usr, callback) {
                                    queuelib.SendMessage(rcpArr[usr], msg_queue).then(function()
                                    {
                                        callback(null,null);
                                    }).catch(function(err){
                                        console.log("Error sending chat_user_add event ",err," for rcp - > ",rcpArr[usr]);
                                        callback(err,null);
                                    });
                                }.bind(null, usr));
                            }
                            async.parallel(f_arr, function (err,itm) {
                                //Part where ChatInfo is sending to the added users
                                let mqueue={
                                    "type":"event",
                                    "params":
                                    {
                                        "chatID":req.params.chatID,
                                        "action":"chat_add",
                                        "chat":data
                                    }
                                }
                                let fs_arr=[];
                                for (us in adArr){
                                    fs_arr.push(function (us, callback) {
                                        queuelib.SendMessage(adArr[us], mqueue).then(function()
                                        {
                                            callback(null,null);
                                        }).catch(function(err){
                                            console.log("Error sending CHAT_ADD event ",err," for rcp -> ",adArr[us]);
                                            callback(err,null);
                                        });
                                    }.bind(null, us));
                                }                                
                                async.parallel(fs_arr, function (err,itm) {
                                    callback(err,adArr);
                                });
                            });
                        }
                    });
                }
            }
            else
                callback("error_auth",null);
        }
        else
            callback(err,null);
    });
}

ChatDeleteUser = function(userID,isadmin,req,callback)
{
    let msg_queue={};
    ModelChat.findOne({"chatID":req.params.chatID},function(err,data){
        if ((err==null)&&(data!=null)&&(data.type!='single'))
        {
            var itmChat=data;
            var errFlag=false;            
            if (helper.inArray(userID,data.chatAdmins,true)==true) //If calling user is admin
            {
                if (isadmin==true) //Handler for admin delete function
                {
                    errFlag=false;
                    for (usr in req.params.chatAdmins)
                    {
                        if (helper.inArray(req.params.chatAdmins[usr],data.chatAdmins,true)==false)
                        {
                            errFlag=true;
                            break;
                        }
                    }

                    if (errFlag==false)
                    {
                        var cntLng=data.chatAdmins.length>1;
                        if (cntLng)
                        {
                            var new_adminList=[];
                            for (usr in data.chatAdmins.toObject())
                            {
                                if (helper.inArray(data.chatAdmins[usr],req.params.chatAdmins,true)==false)
                                    new_adminList.push(data.chatAdmins[usr]);
                            }
                            itmChat.chatAdmins=new_adminList;
                            msg_queue={
                                "type":"event",
                                "params":
                                {
                                    "chatID":req.params.chatID,
                                    "users":req.params.chatAdmins,
                                    "action":"chat_admin_del"
                                }
                            }
                            itmChat.save(function(err,data){
                                if (new_adminList.length>0)
                                {
                                    let f_arr=[];
                                    for (us in new_adminList){                           
                                        console.log("Sending event to [",new_adminList[us],"]->[",req.params.chatID,"]");
                                        f_arr.push(function (us, callback) {
                                            queuelib.SendMessage(new_adminList[us], msg_queue).then(function()
                                            {
                                                callback(null,null);
                                            }).catch(function(err){
                                                callback(err,null);
                                            });
                                            //callback(null,null);
                                        }.bind(null, us));
                                    }
                                    async.parallel(f_arr, function (err,itm) {
                                        //callback(err,req.params.chatAdmins);
                                        let mqueue={
                                            "type":"event",
                                            "params":
                                            {
                                                "chatID":data.chatID,
                                                "action":"chat_del",
                                                "admin": true
                                            }
                                        }
                                        let fs_arr=[];
                                        let chAr=req.params.chatAdmins;
                                        for (us in chAr){
                                            fs_arr.push(function (us, callback) {
                                                queuelib.SendMessage(chAr[us], mqueue).then(function()
                                                {
                                                    callback(null,null);
                                                }).catch(function(err){
                                                    console.log("Error sending CHAT_ADD event ",err," for rcp -> ",chAr[us]);
                                                    callback(err,null);
                                                });
                                            }.bind(null, us));
                                        }
                                        async.parallel(fs_arr, function (err,itm) {
                                            callback(err,req.params.chatAdmins);
                                        });
                                    });
                                }
                                else
                                    callback(null,null);
                                //callback(err,req.params.chatAdmins);
                            })
                        }
                        else
                        {
                            callback("error_last",null); //Try to delete last admin    
                        }
                    }
                    else
                    {
                        callback("error_user",null); // There is no such user in chat
                    }
                }
                else
                {
                    errFlag=false;
                    for (usr in req.params.chatUsers)
                    {
                        if (helper.inArray(req.params.chatUsers[usr],data.chatParticipants,true)==false)
                        {
                            errFlag=true;
                            break;
                        }
                    }
                    if (errFlag==false)
                    {
                        var new_userList=[];
                        //console.log(data.chatParticipants);
                        for (idt in data.chatParticipants.toObject())
                        {                           
                            if (helper.inArray(data.chatParticipants[idt],req.params.chatUsers,true)==false)
                            {
                                new_userList.push(data.chatParticipants[idt]);
                            }
                            
                        }
                        itmChat.chatParticipants=new_userList;
                        
                        msg_queue={
                            "type":"event",
                            "params":
                            {
                                "chatID":req.params.chatID,
                                "users":req.params.chatUsers,
                                "action":"chat_user_del"
                            }
                        }
                        itmChat.save(function(err,data){
                            if (new_userList.length>0)
                            {
                                let f_arr=[];
                                for (usr in new_userList){                           
                                    console.log("Sending event to [",new_userList[usr],"]->[",req.params.chatID,"]");
                                    f_arr.push(function (usr, callback) {
                                        queuelib.SendMessage(new_userList[usr], msg_queue).then(function()
                                        {
                                            callback(null,null);
                                        }).catch(function(err){
                                            callback(err,null);
                                        });
                                    }.bind(null, usr));
                                }
                                async.parallel(f_arr, function (err,itm) {
                                    //callback(err,req.params.chatUsers);
                                    let mqueue={
                                        "type":"event",
                                        "params":
                                        {
                                            "chatID":data.chatID,
                                            "action":"chat_del",
                                            "admin":false
                                        }
                                    }
                                    let fs_arr=[];
                                    let chAr=req.params.chatUsers;
                                    for (us in chAr){
                                        fs_arr.push(function (us, callback) {
                                            queuelib.SendMessage(chAr[us], mqueue).then(function()
                                            {
                                                callback(null,null);
                                            }).catch(function(err){
                                                console.log("Error sending CHAT_ADD event ",err," for rcp -> ",chAr[us]);
                                                callback(err,null);
                                            });
                                        }.bind(null, us));
                                    }
                                    async.parallel(fs_arr, function (err,itm) {
                                        callback(err,req.params.chatUsers);
                                    });
                                    //callback(err,data);
                                });
                            }
                            //callback(err,req.params.chatUsers);
                        });
                    }
                    else
                    {
                        callback("error_user",null); // There is no such user in chat
                    }
                }
            }
            else //Case when calling user is not an admin and he tries to delete himself from the chat
            {
                if ((req.params.chatUsers.lenght==1)&&(helper.inArray(userID,req.params.chatUsers,true)==true)){
                    var partArr=data.chatUsers;                    
                    partArr.splice(partArr.indexOf(userID), 1);
                    chatItem.chatUsers=partArr;
                    chatItem.save(function(err,dat){
                        callback(err,req.params.chatUsers);
                    });
                }
                else
                {
                    callback("error_auth",null);
                }
            }
        }
    });
}

GetChatInfo = function(userID,req,callback)
{
    console.log(req.params);
    if (req.params.chatID!=null)
    {
        ModelChat.findOne({"chatID":req.params.chatID},function(err,data){
            if ((err==null)&&(data!=null))
            {
                console.log(data.chatParticipants);
                if ((helper.inArray(userID,data.chatParticipants,true)==true)||(helper.inArray(userID,data.chatAdmins,true)==true))
                {
                    callback(null,data);
                }
                else
                    callback("error_user",null);
            }
            else
                callback(err,null);
        });
    }
    else
        callback(null,null);
}

SetChatInfo = function(userID,req,callback)
{
    console.log(req.params);
    if (req.params.chatID!=null)
    {
        ModelChat.findOne({"chatID":req.params.chatID},function(err,data){
            if ((err==null)&&(data!=null))
            {
                var chatItm = data;
                if ((helper.inArray(userID,data.chatAdmins,true)==true)&&(req.params.chatInfo!=null))
                {
                    chatItm.chatInfo = req.params.chatInfo;
                    chatItm.save(function(err,data){
                        callback(err,data);
                    });
                }
                else
                {
                    callback("error_user",null);
                }
            }
            else
                callback(err,null)
        });
        
    }
    else
    {
        callback(null,null);
    }    
}


getPublicChat = function(chatID,callback)
{
    console.log("ChatID",chatID);
    ModelChat.findOne({"chatID":chatID},function(err,data){
        callback(err,data);
    })
}

exports.getPublicChat=getPublicChat;
exports.CreateChat=CreateChat;
exports.DeleteChat=DeleteChat;
exports.ChatAddUser=ChatAddUser;
exports.ChatDeleteUser=ChatDeleteUser;
exports.GetChatInfo=GetChatInfo;
exports.SetChatInfo = SetChatInfo;
exports.ChatLeavePublic=ChatLeavePublic;