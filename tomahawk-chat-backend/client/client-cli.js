var menu = require('node-menu');

var demo_client_ws = require("./client.js");

menu.disableDefaultHeader();

menu.addDelimiter('=', 64, ' Demo Client WS -  CLI ')


menu.addItem(
    'Connect to the server',
    function (userID, pass, deviceID) {
        demo_client_ws.Connect(userID, pass, function (err) {
            console.log("Connected!");
        });
    },
    null,
    []
);



menu.addItem(
    'Auth on the server',
    function (userID, pass, dvcType,dvcID,dvcTkn) {
        demo_client_ws.authUser(userID,pass,dvcType,dvcID,dvcTkn,function(err){
        });
    },
    null,
    [
        {'name': 'userID', 'type': 'string'},
        {'name': 'pass', 'type': 'string'},
        {'name': 'dvcType', 'type': 'string'},
        {'name': 'dvcID', 'type': 'string'},
        {'name': 'dvcTkn', 'type': 'string'}
    ]
);


menu.addItem(
    'Fast login',
    function (key) {
        demo_client_ws.fastLogin(function(err){
        });
    },
    null,
    []
);

menu.addItem(
    'SendMSG',
    function (link) {
        demo_client_ws.sendMSG(function (err) {});
    },
    null,
    []
);

menu.addItem(
    'Deliver Packet',
    function (packetID) {
        demo_client_ws.deliverMSG(packetID,function (err) {});
    },
    null,
    [
        {'name': 'packetID', 'type': 'string'}
    ]
);

menu.addItem(
    'GetMsg',
    function (link) {
        demo_client_ws.getMSG(function (err) {
        });
    },
    null,
    []
);

menu.addItem(
    'SendFile',
    function (file_size, chatID, destList){
        demo_client_ws.sendFile(file_size, chatID, destList,function (err) {
        });
    },
    null,
    [
        {'name': 'file_size', 'type': 'string'},
        {'name': 'chatID', 'type': 'string'},
        {'name': 'destList', 'type': 'string'}
    ]
);

menu.addItem(
    'GetBlob',
    function (accountID,cellType,cellIndex) {
        demo_client_ws.getBlob(accountID,cellType,cellIndex,function (err) {
        });
    },
    null,
    [
        {'name': 'accountID', 'type': 'string'},
        {'name': 'cellType', 'type': 'string'},
        {'name': 'cellIndex', 'type': 'string'}
    ]
);

menu.addItem(
    'SetBlob',
    function (cellType,cellIndex,data) {
        demo_client_ws.setBlob(cellType,cellIndex,data,function (err) {
        });
    },
    null,
    [        
        {'name': 'cellType', 'type': 'string'},
        {'name': 'cellIndex', 'type': 'string'},
        {'name': 'data', 'type': 'string'}
    ]
);

menu.addItem(
    'Get public ContactList',
    function () {
        demo_client_ws.getContactList(function (err) {
        });
    },
    null,
    []
);


menu.addItem(
    'CreateChat',
    function (participants,chatInfo,chatName) {
        demo_client_ws.CreateChat([participants],chatInfo,chatName,function (err) {
        });
    },
    null,
    [        
        {'name': 'participants', 'type': 'string'},
        {'name': 'chatInfo', 'type': 'string'},
        {'name': 'chatName', 'type': 'string'}
    ]
);

menu.addItem(
    'CreatePublic',
    function (participants,chatInfo,chatName) {
        demo_client_ws.CreatePublic([participants],chatInfo,chatName,function (err) {
        });
    },
    null,
    [        
        {'name': 'participants', 'type': 'string'},
        {'name': 'chatInfo', 'type': 'string'},
        {'name': 'chatName', 'type': 'string'}
    ]
);


menu.addItem(
    'DeleteChat',
    function (chatID) {
        demo_client_ws.DeleteChat(chatID,function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'}
    ]
);

menu.addItem(
    'Delete public chat',
    function (chatID) {
        demo_client_ws.DeletePublic(chatID,function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'}
    ]
);

menu.addItem(
    'Add Users into Chat',
    function (chatID,userList) {
        demo_client_ws.ChatAddUser(chatID,[userList],function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'userList', 'type': 'string'}
    ]
);

menu.addItem(
    'Add Admin into Chat',
    function (chatID,userList) {
        demo_client_ws.ChatAddAdmin(chatID,[userList],function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'userList', 'type': 'string'}
    ]
);

menu.addItem(
    'Del Admin from the Chat',
    function (chatID,userList) {
        demo_client_ws.ChatDelAdmin(chatID,[userList],function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'userList', 'type': 'string'}
    ]
);

menu.addItem(
    'Del User from the Chat',
    function (chatID,userList) {
        demo_client_ws.ChatDelUser(chatID,[userList],function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'userList', 'type': 'string'}
    ]
);


menu.addItem(
    'Set chat info',
    function (chatID,chatInfo,chatName) {
        demo_client_ws.SetChatInfo(chatID,chatInfo,chatName,function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'chatInfo', 'type': 'string'},
        {'name': 'chatName', 'type': 'string'}
    ]
);


menu.addItem(
    'Get chat info',
    function (chatID) {
        demo_client_ws.GetChatInfo(chatID,function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'}
    ]
);

menu.addItem(
    'Create single chat 1x1',
    function (userID) {
        demo_client_ws.CreateSingleChat(userID,function (err) {
        });
    },
    null,
    [        
        {'name': 'userID', 'type': 'string'}
    ]
);

menu.addItem(
    'Send MSG into chat',
    function (chatID,msgText) {
        demo_client_ws.sendPublic(chatID, msgText ,function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'},
        {'name': 'msgTxt', 'type': 'string'}
    ]
);

menu.addItem(
    'Get MSG from Chat',
    function (chatID) {
        demo_client_ws.getPublic(chatID, function (err) {
        });
    },
    null,
    [        
        {'name': 'chatID', 'type': 'string'}
    ]
);


menu.addItem(
    'Register User step1',
    function (username) {
        demo_client_ws.regUser(username,function (err) {
        });
    },
    null,
    [
        {'name': 'username', 'type': 'string'}
    ]
);

menu.addItem(
    'Register User step2',
    function (pwd) {
        demo_client_ws.regUser2Step(pwd,function (err) {
        });
    },
    null,
    [        
        {'name': 'pwd', 'type': 'string'}
    ]
);


menu.addItem(
    'Update Token',
    function (dvcID,dvcTkn) {
        demo_client_ws.updateToken(dvcID,dvcTkn,function (err) {
        });
    },
    null,
    [        
        {'name': 'dvcID', 'type': 'string'},
        {'name': 'dvcTkn', 'type': 'string'}
    ]
);

menu.addItem(
    'Logout',
    function (){
        demo_client_ws.Logout(function (err){
        });
    },
    null,
    []
);

menu.start();