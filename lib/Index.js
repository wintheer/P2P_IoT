/**
 * Each node has a nodeID, a quasi-unique binary number that identifies it in the network.
 */
var async = require('async');
var http = require('http');
var node = require('./Node');
var port = 8282;
var randomNr = require('./Utilities');
var serviceRootUrl = 'http://localhost:8686';

http.createServer(function (request, response) {
    console.log("Server has been started")
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("First random nummer: "+randomNr.createQuasi(8));
    var n = new node(process.argv.slice(2)[0]);
    response.write("\nNodeID: "+ n.nodeID.toString());
    response.write("\nNodeIPAddress: "+ n.nodeIPAddress.toString());
    response.write("\nNodePort: "+ n.port.toString());
    response.end();

}).listen(port);
console.log('Server listening on http://localhost:' + port);