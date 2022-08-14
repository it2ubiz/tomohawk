var mongoModel      = require('../mongo/mongoModels.js');
var helper          = require('../helpers.js');


exports.CreateToken =function(userID,callback){
    var tkn = new mongoModel.ModelUserToken();
    tkn.userID  = userID;
    tkn.tokenID = helper.CreateTokenGUID(userID);
    tkn.tokenTimeStamp=Date.now(),
    tkn.tokenHash = helper.generateSalt(50);
    tkn.save(function(err,itm){
        callback(err,itm);
    })
}

exports.FindToken=function(tokenID,userID,callback){
    mongoModel.ModelUserToken.find({"userID":userID,"tokenID":tokenID},function(er,dt){
        callback(er,dt);
    });
}

exports.delTokens = function(userID,callback){
    mongoModel.ModelUserToken.remove({"userID":userID},function(er,dt){
        callback(er,dt);
    })
}