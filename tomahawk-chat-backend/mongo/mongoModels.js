var mongoose    = require('mongoose');

var modelMsg={
    _id:{type:Number},
    messageID: {
        type:'string'
    },
    msgSender:{
        type:'string'
    },
    msgRcp:{
        type:'string'
    },
    msgBody:{
        type:"string"
    },
    msgChat:{
        type:"string"
    },
    packetID:{
        type:"string"
    },
    type:{
        type:"string"
    },
    status:{
        type:"string"
    }
}

var UserModel = {
    userGUID:{type:"string"},
    userID:{type:"string"},
    userName:{type:"string"},
    userPublicBlob:{type:"string"}, //ceil=1
    userPwd:{type:"string"}, 
    userPrivateBlob:{type:"string"}, //ceil=2
    contactlistBlob:{type:"string"},  //ceil=3
    deviceListBlob:{type:"string"},  //ceil=4
    dataHash:{type:"string"}
}

var ChatModel = {
    chatID: {type:"string"},
    chatParticipantSign:{type:"string"},
    chatAdminSign:{type:"string"},
    chatInfo:{type:"string"},
    chatName:{type:"string"},
    chatParticipants:[String],
    chatAdmins:[String],
    chatType:{type:"string"},
    chatLink:{type:"string"},
    type:{type:"string"}
}


var modelPublicMsg={
    messageID: {type:'string'},
    msgSender:{type:'string'},
    msgRcp:{type:'string'},
    msgBody:{type:"string"},
    msgChat:{type:"string"},
    packetID:{type:"string"},
    type:{type:"string"},
    status:{type:"string"},
    msgTimeStamp:{type:"string"},
    msgNumber:{type:Number,unique: true}
}

var ChatUserMsg={
    userID:{type:'string'},
    chatID:{type:'string'},
    msgID:{type:'string'},
    msgTimeStamp:{type:'string'}
}

// Section for counter model
var CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counterModel = mongoose.model('Counter', CounterSchema);
// END Section for counter model

var AccountModel={
    userID:{type:'string'},
    userPwd:{type:'string'},
    userKey:{type:'string'},
    userSalt:{type:'string'}
}

var ContactList ={
    userID:{type:'string'},
    contactID:{type:"string"},
    contactName:{type:"string"},
    contactAvatar:{type:"string"}
}

var UserDevice ={
    userID:{type:'string'},
    deviceID:{type:'string'},
    deviceToken:{type:'string'},
    deviceType:{type:'string'},
    locked:{type:Boolean},
    deviceGUID:{type:'string'}
}

var UserToken ={
    userID:{type:'string'},
    tokenID:{type:'string'},
    tokenTimeStamp:{type:'string'},
    tokenHash:{type:"string"}
}



model_Msg           = new mongoose.Schema(modelMsg,{ _id: false });
model_User          = new mongoose.Schema(UserModel);
model_Chat          = new mongoose.Schema(ChatModel);
model_PublicMsg     = new mongoose.Schema(modelPublicMsg);
model_ChatUserMsg   = new mongoose.Schema(ChatUserMsg);
model_AccountModel  = new mongoose.Schema(AccountModel);
model_ContactList   = new mongoose.Schema(ContactList);
model_UserDevice    = new mongoose.Schema(UserDevice);
model_UserToken     = new mongoose.Schema(UserToken);

//Section where counters updates
model_PublicMsg.pre('save', function(next) {
    var doc = this;    
    counterModel.findByIdAndUpdate('pmid', {$inc: { seq: 1} }, function(error, counter){
        if(error)
            return next(error);
        doc.msgNumber = counter.seq;
        next();
    });
});

model_AccountModel.pre('save', function(next) {
    var doc = this;    
    counterModel.findByIdAndUpdate('uid', {$inc: { seq: 1} }, function(error, counter){
        if(error)
            return next(error);
        doc.userID = "ZT"+counter.seq+"@tomahawk.chat";
        next();
    });
});


model_Msg.pre('save', function(next) {
    var doc = this;    
    counterModel.findByIdAndUpdate('mid', {$inc: { seq: 1} }, function(error, counter){
        if(error)
            return next(error);        
        doc._id = counter.seq;
        next();
    });
});


//End section
exports.ModelMessage       = mongoose.model('msgQueue', model_Msg);
exports.ModelUser          = mongoose.model('User', model_User);
exports.ModelChat          = mongoose.model('Chat', model_Chat);
exports.ModelPublicMsg     = mongoose.model('msgPublic', model_PublicMsg);
exports.ModelChatUserMsg   = mongoose.model('userChatMsg',model_ChatUserMsg);
exports.modelAccountModel  = mongoose.model('userAccount',model_AccountModel);
exports.ModelContactList   = mongoose.model('contactList',model_ContactList);
exports.ModelUserDevice    = mongoose.model('userDevice',model_UserDevice);
exports.ModelUserToken     = mongoose.model('userToken',model_UserToken);