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
    response.write(randomNr.createQuasi(8));
    response.end();

}).listen(port);


/**
 * Constructor for the Node Class
 * @param nodeID
 * @param IDAddress
 * @param port
 * @constructor

function Node(nodeID, IDAddress, port) {
    this.nodeID = nodeID;
    this.IDAddress = IDAddress;
    this.port = port;
}
 */


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