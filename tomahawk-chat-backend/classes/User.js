var mongoModel=require('../mongo/mongoModels.js');
var crypto = require('crypto');

var ModelUser = mongoModel.ModelUser;
var helper  =   require ("../helpers.js")

var hashTabe=[];

GetUserBlob = function(userID,req,callback){    
    var fieldList=null;
    var err=null;    
    if (req.params.cellType==='private'){
        if (userID==req.params.accountID)
        {
            switch (req.params.cellIndex){
                case 0:
                    fieldList="userPrivateBlob";
                    break;
                case 1:
                    fieldList="contactlistBlob";
                    break;
                case 2:
                    fieldList="deviceListBlob";
                    break;
            }
        }
        else
        {
            err="error_bad_format";
            callback(err,null);
            return;
        }
    }
    else{
        if ((req.params.cellType=="public")&&(req.params.cellIndex==0))
            fieldList="userPublicBlob";
    }

    if (fieldList!=null)
    {
        let fieldName=fieldList;
        let res_val={}
        fieldList=fieldList+" "+"dataHash";
        ModelUser.findOne({'userID':req.params.accountID},fieldList,function (err, usr) {
            res_val.data=usr[fieldName];
            res_val.dataHash=usr["dataHash"];
            if (err!=null)
                err="error_internal";
            callback(err,res_val);
        });
    }
    else
    {
        let err="error_cell_index";
        callback(err,null);
        return;
    }
}

SetUserBlob = function(userID,req,callback){    
    if ((req.params.cellType!=null)&&(req.params.cellIndex!=null)&&(req.params.data!=null))
    {        
        var nUser=new ModelUser();
        var upgFiled={};
        let err=null;
        if (req.params.cellType==='private'){
            switch (req.params.cellIndex){
                case 0:
                    upgFiled={"userPrivateBlob":req.params.data,"dataHash":makeDataHash(req.params.data)};
                    break;
                case 1:
                    upgFiled={"contactlistBlob":req.params.data,"dataHash":makeDataHash(req.params.data)};
                    break;
                case 2:
                    upgFiled={"deviceListBlob":req.params.data,"dataHash":makeDataHash(req.params.data)};
                    break;
            }
        }
        else{
            if (req.params.cellIndex==0)
                upgFiled={"userPublicBlob":req.params.data,"dataHash":makeDataHash(req.params.data)};
        }
        if (upgFiled!=null){
            ModelUser.findOneAndUpdate({"userID":userID},upgFiled,{"upsert":true},function(err,dat){
                if (err!=null)
                    err="error_internal";
                callback(err,dat);
            });
        }
        else
        {
            let err="error_cell_index";
            callback(err,null);
            return;
        }
    }
}

makeDataHash=function(data){
    return crypto.createHash('md5').update(data).digest("hex");
}

RegUser = function(req,callback){
    if ((req.params.version!=null)&&(req.params.publicKey!=null)&&(req.params.username!=null))
    {
        if (req.params.version==1)
        {
            mongoModel.ModelUser.count({"userName":req.params.username},function(err, c) {
                if (c!=0)
                {
                    callback("err_username",null);
                }
                else
                {
                    var userAcc=new mongoModel.modelAccountModel();
                    userAcc.userKey  = req.params.publicKey;
                    userAcc.userSalt = helper.generateSalt(50);
                    userAcc.save(function(err,dta){
                        hashTabe[userAcc.userSalt]=dta;
                        callback(err,dta);
                    });
                }
            });
        }
        else
        {
            callback(null,null);
        }
    }
    else
        callback("err_incorrect",null);
}

UpdateUserAcc = function(qry,upd,callback)
{
    mongoModel.modelAccountModel.findOneAndUpdate(qry,upd,function(err,data){        
        callback(err,data);
    });
}

getUserByUID=function(uid,callback){
    mongoModel.modelAccountModel.findOne({"userID":uid},function(err,data){
        callback(err,data);
    });
}

exports.getUserByUID=getUserByUID;
exports.GetUserBlob=GetUserBlob;
exports.SetUserBlob=SetUserBlob;
exports.RegUser=RegUser;
exports.UpdateUserAcc=UpdateUserAcc;
