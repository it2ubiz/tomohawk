
//exports.FileServerURL   = "ws://127.0.0.1:8080/";
exports.FileServerURL     = "wss://file.zerotalk.net"

exports.ServerPort      = 3001;

//exports.ServerURL      = "ws://127.0.0.1:3001/"
//exports.ServerURL      = "wss://test.zerotalk.net/"
//exports.ServerURL      = "ws://dev.zerotalk.net/"
//exports.ServerURL        = "wss://142.93.224.121/"

exports.ServerURL        = "wss://api2.platform.safechats.com/"

exports.mqULR          = "amqp://admin:Safe01@@b.maxtg.com:5672"
exports.mongoDBUrl     = "mongodb://localhost:27017/msgstore"

exports.NoPacketDelivery = true

exports.LoggerConfig={
    host:"localhost",
    port:27017,
    dbname:"logs"
}

exports.serverPublicKey="2EC8O8TNqVsHSnXBoP1rft7fRfMVVsfWErfRmPPntCaFoXX6Nr";

var clientToken="ee13464da641d1be637245ee7f384c70bcb88ab42fbdd866116d8007aed7169857c40e34e864c976e0038f88c5b9071338f85ba8ddd0b1de1678092b0671aea29f7f45d58559e79eb0d79f1589c123f9d031445690af0685b26d01728b16d3defbaeb6ccab718eb9f0df75d4b1ead84429b990763880b09e351d57cddf58d9e30a6a0b56ef00941c9577b477edaf019170d7717fc09fc670c997b015a9359f42c26f1f2c2c5c89da82fab9cedaf095f8be044e92e6f4727c6334b13bd4156f3b9e36d16684af16de0a50f9bfa6ecc31da181bb3cab0aadbc4c86bfd068746a96";

exports.clientToken = clientToken;