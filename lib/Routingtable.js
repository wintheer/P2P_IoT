/**
 * This class consists of a multidimensional array, meaning it's an array containing arrays
 * To be precise it contains k-arrays which here is referred to as k-buckets, each containing
 * k nodes
 */

var constants = require('./../config/constants');
var bucket = require('./Bucket');
var utilities = require('./Utilities');

var routingTable = [];

function routing_table() {
    createBuckets();
}

// Creates k-buckets
function createBuckets() {
    for(var i = 0; i < constants.k; i++){
        routingTable.push(new bucket());
    }
}

function findDistanceBetweenNodes(nodeID, otherNodeID) {
    return distance = nodeID ^ otherNodeID;
}

/**
 * Puts the given nodeID with the given distance from this node in the right bucket index
 * @param nodeID
 * @param distance
 */
function putInRightIndexedBucket(nodeID, distance) {
    var index = utilities.findMostSignificantBit(distance);
    var currentBucket = routingTable[index];

    // If the bucket is full, it will ping all it's notes to see, if can switch it out with the new node
    if(currentBucket.isBucketFull) {
        currentBucket.pingAllIdsInBucket();
    }
    else {
        routingTable[index].addNode(nodeID);
    }
}