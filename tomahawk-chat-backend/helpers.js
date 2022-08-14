var crypto = require('crypto');
var uuid = require('node-uuid');

exports.CreateGUID = function(userID, deviceID)
{
	// generate GUID for a new user
	var hash = crypto.createHash('sha512');
	hash.update(userID);	
	var nodeID = hash.digest(); // Returns a Buffer object

	var material = {random: nodeID.slice(0, 16)};
	var GUID = uuid.v4(material);

	return (GUID);
};

exports.inArray = function(needle, haystack, strict) {
	var found = false, key, strict = !!strict;
	for (key in haystack) {
		if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
			found = true;
			break;
		}
	}
	return found;
}

exports.DropDuplicates = function(ar){
    for (var q=1, i=1; q<ar.length; ++q){
        if (ar[q] !== ar[q-1]) {
            ar[i++] = ar[q];
        }
    }
    ar.length = i;
    return ar;
}


exports.CreateChatID = function(userID, domainName)
{
	var hash = crypto.createHash('sha512');

	hash.update(domainName);
	hash.update(userID);

	// add timestamp
	hash.update(new Date().valueOf().toString());

	var nodeID = hash.digest(); // Returns a Buffer object
	var random = {random: nodeID.slice(0, 16)};
	var chatID = uuid.v4(random);

	return (chatID);
};

exports.CreateSingleChatID = function(userID1, userID2)
{
	var hash = crypto.createHash('sha512');

	hash.update(userID1);
	hash.update(userID2);
	var nodeID = hash.digest(); 
	var random = {random: nodeID.slice(0, 16)};
	var chatID = uuid.v4(random);
	return (chatID);
};

exports. ParseInputJSON = function (inputString)
{
	var outputJson={}
	//console.log(inputString);
	outputJson.json=JSON.parse(inputString);
	if (outputJson.json.request!=null)
		outputJson.parsed=outputJson.json.request;
	else
		outputJson.parsed=outputJson.json;
	return outputJson;
}

exports.CreateMessageGUID = function(sender,chatID)
{
	var hash = crypto.createHash('sha512');		
	hash.update(JSON.stringify(sender));	
	hash.update(JSON.stringify(chatID));
	hash.update(new Date().valueOf().toString());
	var messageID = hash.digest('hex');
	messageID = messageID.slice(0, 32);
	return (messageID);
}

exports.generateSalt = function(len)
{
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        setLen = set.length,
        salt = '';
    for (var i = 0; i < len; i++)
	{
        var p = Math.floor(Math.random() * setLen);
        salt += set[p];
    }
    return (salt);
};

exports.CreateTokenGUID=function(userID) {
	var hash = crypto.createHash('sha512');
	hash.update(JSON.stringify(userID));
	hash.update(new Date().valueOf().toString());
	var tokenID = hash.digest('hex');
	tokenID = tokenID.slice(0, 32);
	return (tokenID);
}

exports.EncryptToken=function(key, data) {
    var cipher = crypto.createCipher('aes256', key);
    var crypted = cipher.update(JSON.stringify(data), 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

exports.DecryptToken = function(key, data) {
	console.log("data",data);
    var decipher = crypto.createDecipher('aes256', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}