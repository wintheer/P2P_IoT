/**
 * Each node has a nodeID, a quasi-unique binary number that identifies it in the network.
 */
var async = require('async');
var http = require('http');
var port = 8282;
var randomNr = require('./Utilities');
var serviceRootUrl = 'http://localhost:8686';

http.createServer(function (request, response) {
    console.log("Server has been started")
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("First random nummer: "+randomNr.createQuasi(8));
    var node = new Node(randomNr.createQuasi(8), randomNr.createQuasi(8), 1212);
    response.write("\nNodeID: "+ node.nodeID.toString());
    response.write("\nNodeIPAddress: "+ node.nodeIPAddress.toString());
    response.write("\nNodePort: "+ node.port.toString());
    response.end();

}).listen(port);
console.log('Server listening on http://localhost:' + port);


/**
 * Constructor for the Node Class
 * @param nodeID
 * @param nodeIPAddress
 * @param port
 * @constructor
 */
function Node(nodeID, nodeIPAddress, port) {
    this.nodeID = nodeID;
    this.nodeIPAddress = nodeIPAddress;
    this.port = port;
}



//module.exports = Node;




function k_Buckets() {
    async.series([createBucket, organizeBucket])
}



/**
 * Function for organizing contacts, other nodes known, in buckets which hold a maximum of k contacts (k-buckets).
 */
function createBucket(callback) {

}

function organizeBucket(callback) {
    
}

/**
 *

function findDistance(var otherNodeID) {
    return nodeID ^ otherNodeID;
}
 */