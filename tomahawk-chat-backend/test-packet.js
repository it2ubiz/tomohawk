var Struct = require('struct');

var packet_header = new Struct()
    .word32Ule('signature')     // 0 or 1 for instance
    .word32Ule('sequenceNumber')
    .word64Ule('length');
    
var packet = new Struct()
    .chars('ssl_header')
    .struct(packet_header)
    .chars("packet_data")
    .chars("packet_signature")

packet.allocate();
var buf = packet.buffer();
var proxy = packet.fields;

proxy.signature         = "0xRTewe";
proxy.sequenceNumber    = 10;
proxy.length            = 20;
proxy.ssl_headers       = "0xAS12GF";

console.log(buf);