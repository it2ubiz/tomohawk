var mongoose        = require('mongoose');
var mongoModel = require("./mongoModels.js");

mongoose.connect('mongodb://localhost:27017/msgstore', { promiseLibrary: global.Promise });

exports.HelperReceivePacket=function(userID,callback){
    var ModelMessage=mongoModel.ModelMessage;
    ModelMessage.aggregate([
        {$match: {msgRcp:userID}},
        {$group: {
            _id: '$packetID'            
        }}
    ], function (err, result) {        
        callback(err,result);
    });
}