var randomNumber = require('./Utilities');
/**
 * Constructor for the Node Class
 * @param nodeID
 * @param nodeIPAddress
 * @param port
 * @constructor
 */

var nodeID;
var nodeIPAddress;
var Port;

function Node(port) {
    this.nodeID = randomNumber.createQuasi(8);
    this.nodeIPAddress = randomNumber.createQuasi(8);
    this.port = port;
}



module.exports = Node;

/**
 *

function findDistance(var otherNodeID) {
    return nodeID ^ otherNodeID;
}
 */