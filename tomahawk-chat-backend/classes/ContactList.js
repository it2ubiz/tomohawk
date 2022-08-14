var mongoModel=require('../mongo/mongoModels.js');
var helper=require('../helpers.js');

var ModelContactList        = mongoModel.ModelContactList;

exports.getPublic=function(uID,callback)
{
    ModelContactList.find({"userID":uID},function(er,dt){
        callback(er,dt);
    })
}


