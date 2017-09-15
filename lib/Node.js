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
var port;

function Node(nodeID, nodeIPAddress, port) {
    this.nodeID = nodeID;
    this.nodeIPAddress = nodeIPAddress;
    this.port = port;
}
function lookUpRequest(nodeID) {

}


module.exports = Node;
//this.nodeIPAddress = randomNumber.createQuasi(8);
