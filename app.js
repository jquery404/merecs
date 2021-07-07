const http = require("http");          
const express = require("express"); 
const serveStatic = require("serve-static");
const socketIo = require("socket.io");       
const easyrtc = require("open-easyrtc");     
const port = process.env.PORT || 8080;

process.title = "node-easyrtc";

var app = express();
app.use(express.static('client'));

var server = http.createServer(app);
var socketServer = socketIo.listen(server, {"log level": 1});

var myIceServers = [
    {"url":"stun:stun.l.google.com:19302"},
    {"url":"stun:stun1.l.google.com:19302"},
    {"url":"stun:stun2.l.google.com:19302"},
    {"url":"stun:stun3.l.google.com:19302"},
    {
        "url": 'turn:192.158.29.39:3478?transport=udp',
        "credential": 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        "username": '28224511:1379330808'
        // url: 'turn:numb.viagenie.ca',
        // credential: 'zx1234',
        // username: 'jquery404@gmail.com'
    }
  // {
  //   "url":"turn:[ADDRESS]:[PORT]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // },
  // {
  //   "url":"turn:[ADDRESS]:[PORT][?transport=tcp]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // }
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);

easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
// easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
//     console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
//     easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
// });

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    // rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    //     console.log("roomCreate fired! Trying to create: " + roomName);

    //     appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    // });
});

server.listen(port, () => {
    console.log('listening everything on ' + port);
});
