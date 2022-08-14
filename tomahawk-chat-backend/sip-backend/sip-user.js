//Here describe DB Scheme of openSIPS http://www.opensips.org/Documentation/Install-DBSchema-2-2#AEN8147
/*DB SCEME is:
    id: unsigned int: 10
    username:string:64
    domain:string:64
    password:string:25
    email_address:string:64
    ha1:string:64:md5(username:realm:password)
    ha1b:string:64:md5(username@domain:realm:password)
    rpid: string:64:The SIP Remote-Party-ID header identifies 
                    the calling party and includes user, party, screen 
                    and privacy headers that specify how a call is presented and screened
*/

var mysql      = require('mysql');
var config     = require('../config.js');

var connection = mysql.createConnection({
    host     : config.sipDBHost,
    user     : config.sipDBUser,
    password : config.sipDBPwd
});

connection.connect(function(err) {
    if (err)
        console.log("MySQL connection error");
});

exports.createUser=function(req,record,callback){
    if ((req.params.username!=null)&&(req.param.domain!=null)&&(req.params.password!=null)
        &&(req.params.email))
    {
        let ha1  = md5(req.param.username+":openSIPS:"+req.params.password);
        let ha1b = md5(req.param.username+"@"+req.param.domain+":openSIPS"+req.params.password);
        let rpid = 0;
        let qry  = "INSERT INTO subscriber VALUES("+req.param.username+","+req.param.domain+","+req.param.password+","+req.param.email+","+ha1+","+ha1b+","+rpid+")";
        connection.query(qry,function(error, result)
        {
            callback(error,result);
        });
    }
}


exports.deleteUser=function(req,record,callback){
    if ((req.params.username!=null)&&(req.param.domain!=null))
    {
        let qry  = "DELETE FROM subscriber WHERE username="+req.params.username+" AND domain="+req.params.domain;
        connection.query(qry,function(error, result)
        {
            callback(error,result);
        });
    }
}


exports.updateUser=function(req,record,callback){
    if ((req.params.username!=null)&&(req.param.domain!=null)&&(req.params.password!=null)
        &&(req.params.email))
    {
        let ha1  = md5(req.param.username+":openSIPS:"+req.params.password);
        let ha1b = md5(req.param.username+"@"+req.param.domain+":openSIPS"+req.params.password);
        let rpid = 0;
        let qry  = "UPDATE subscriber SET password="+req.param.password+",ha1="+ha1+", ha1b="+ha1b+"WHERE username="+req.params.username+" AND domain="+req.params.domain;
        connection.query(qry,function(error, result)
        {
            callback(error,result);
        });
    }
}