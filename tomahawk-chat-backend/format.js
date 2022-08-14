exports.PublicResp = function(request,resp)
{
    let response={}
    response.status=200;
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status": "success",
            "params":
            {
                "messages":resp
            }
        //}
    };
    return response.body;
}

exports.PublicErr = function(request,err)
{
    let response={}
    response.status=200;
    response.body={
    //"result": {
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status": err,
            "params":
            {
                "messages":null
            }
        };
    //};
    return response.body;
}


exports.SendMessageResp = function(request,msg_ids){
    let response={}
    response.status=200;
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status" : "success",
            "params" :
            {
                "messages" :msg_ids
            }
        //}
    }
    return response.body;
}

exports.SendMessageRespErr=function(request,err){
    let response={}
    response.status=404;
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status" : "error",
            "params" :
            {
                "Error" :err
            }
        //}
    }
    return response.body;
}


exports.getDataResponse = function(request,resp)
{
    let response={}
    response.status=200;
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status": "success",
            "params":
            {
                "data":resp.data,
                "dataHash":resp.dataHash
            }
        //}
    };
    return response.body;
}

exports.getDataResponseError = function(request,err)
{
    let response={}
    response.status=404;
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "params":
            {
                "dataHash":null
            }
        //}
    };
    return response.body;
}

exports.putDataBlob=function(request,result)
{
    var response={}
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status": "success",
            "params":
            {                        
                "dataHash": result.dataHash
            }
        //}                
    };    
    response.status=200;
    return response.body;
}


exports.putDataBlobErr=function(request,err)
{
    var response={}
    response.body={
        //"result":{
            "timestamp" : Date.now(),
            "requestID" : request.requestID,
            "method" : request.method,
            "status": err,
            "params":
            {                        
                "dataHash": null
            }
        //}                
    };    
    response.status=404;
    return response.body;
}

exports.TokenRequest=function(num_token)
{
    let request={
        "method" : "create_token",
        "params" :
        {
            "tokenCount" : num_token
        }
    }
    return request;
}

exports.CreateChat=function(request,err,data)
{
    var response={}
    if(err==null)
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "chatID":data.chatID
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "chatID":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.CreatePublic=function(request,err,data)
{
    var response={}
    if(err==null)
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "chatID":data.chatID
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "publicID":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.DeleteChat=function(request,err,data)
{
    var response={}
    if(err==null)
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "delID":data.chatID
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "delID":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

//delPublic

exports.DeletePublic=function(request,err,data)
{
    var response={}
    if(err==null)
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "delPublic":data.chatID
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "delPublic":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.ChatAddUser=function(request,err,dta){
    var response={}
    if(err==null)
    {
        
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "usersAdded":dta
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "usersAdded":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.ChatAddAdmin=function(request,err,dta){
    var response={}
    if(err==null)
    {
        
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "adminsAdded":dta
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "adminsAdded":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}


exports.ChatDelUser=function(request,err,dta){
    var response={}
    if(err==null)
    {
        
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "usersDeleted":dta
                }
            //}
        }
        response.status=200;        
    }
    else
    {
        response.body={
            //"result":{
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "usersDeleted":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.ChatDelAdmin=function(request,err,dta){
    var response={}
    if(err==null)
    {
        
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "adminsDeleted":dta
                }
            //}
        }
        response.status=200;
    }
    else
    {
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "adminsDeleted":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.ChatGetInfo=function(request,err,dta){
    var response={}
    if(err==null)
    {
        
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "chatID"   : dta.chatID,
                    "chatInfo" : dta.chatInfo,
                    "chatName" : dta.chatName
                }
            //}
        }
        response.status=200;
    }
    else
    {
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "chatInfo":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.ChatSetInfo=function(request,err,dta){
    var response={}
    if(err==null)
    {
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : "success",
                "params":
                {
                    "updID":dta.chatID
                }
            //}
        }
        response.status=200;
    }
    else
    {
        response.body={
            /*"result":
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method" : request.method,
                "status" : err,
                "params":
                {
                    "updID":null
                }
            //}
        }
        response.status=404;
    }
    return response.body;
}

exports.RegOutput = function(step,request,err,dta){
    let rst={}
    if (step==1)
        if (err!=null)
        {
            rst={            
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method"    : request.method,
                "status"    : err
            }
        }
        else
        {
            rst={
            /* "result":
                {*/
                    "timestamp" : Date.now(),
                    "requestID" : request.requestID,
                    "method"    : request.method,
                    "status"    : "success",
                    "params"    :
                    {
                        "random":dta.userSalt
                    } 
                /*}*/
            }
        }
    else
        rst={
            /*"result" :
            {*/
                "timestamp" : Date.now(),
                "requestID" : request.requestID,
                "method"    : request.method,
                "status"    : "success",
                "params"    :
                {
                    "userID" : dta.userID
                }
            /*}*/
        }
    return rst;
}

exports.PublicContactList = function(request,err,dta){
    let rst={
        "timestamp" : Date.now(),
        "requestID" : request.requestID,
        "method"    : request.method,
        "status"    : "success",
        "params"    :
        {
            "contacts":
            {
                "contactList":dta
            }
        } 
    }
    return rst;
}

exports.ChatFormat = function(data){
    console.log("data",data);
    let resp={
        "chatParticipants" : data.chatParticipants,
        "chatAdmins" : data.chatAdmins,
        "type" : data.type,
        "chatInfo" : data.chatInfo,
        "chatName" : data.chatName,
        "chatID" : data.chatID,
    }
    return resp;
}