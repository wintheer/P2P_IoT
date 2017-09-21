/**
 * This class consists of a multidimensional array, meaning it's an array containing arrays
 * To be precise it contains k-arrays which here is referred to as k-buckets, each containing
 * k nodes
 */

var constants = require('./../config/constants');
var kBucket = require('./Bucket');
var utilities = require('./Utilities');

var routingTable = [];

function routing_table() {
    createBuckets();
}

// Creates k-buckets
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

/**
 * Puts the given nodeID with the given distance from this node in the right bucket index
 * @param nodeID
 * @param distance
 */
function putInRightIndexedBucket(nodeID, distance) {
    var
    var tempBucket = routingTable[utilities.findMostSignificantBit(distance)];
    tempBucket.
}