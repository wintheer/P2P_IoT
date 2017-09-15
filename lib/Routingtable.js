var constants = require('./../config/constants');
var kBucket = require('./kBucket');
var utilities = require('./Utilities');

var routingTable = [];

function routing_table() {
    createBuckets();
}

function createBuckets() {
    for(var i = 0; i < constants.k; i++){
        routingTable.push(new kBucket());
    }
}
function sortBuckets(nodeID, otherNodeID) {
    return Math.floor(Math.log[2](findDistanceBetweenNode(nodeID, otherNodeID)));
}
function findDistanceBetweenNode(nodeID, otherNodeID) {
    return distance = nodeID ^ otherNodeID;
}