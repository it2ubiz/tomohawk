var mongoModel      = require('../mongo/mongoModels.js');
var helper          = require('../helpers.js');


exports.UpdateDevice = function(userID,dvcType,dvcID,dvcTkn,callback)
{
    mongoModel.ModelUserDevice.findOneAndUpdate(
        {"userID":userID,"deviceType":dvcType, "deviceID":dvcID},
        {"deviceToken":dvcTkn},{upsert:true},function(er,upd){
            callback(er,upd);
    })
}