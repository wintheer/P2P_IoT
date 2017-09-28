/**
 * This class consists of a multidimensional array, meaning it's an array containing arrays
 * To be precise it contains k-arrays which here is referred to as k-buckets, each containing
 * k nodes
 */

var constants = require('./config/constants');
var bucket = require('./Bucket');
var index = require('./Index');
var utilities = require('./Utilities');

var routingTable = [];








module.exports = {
    findDistanceBetweenNodes: findDistanceBetweenNodes(),
    findNode: findNode(),
    addPeer: addPeer(),
    putInRightIndexedBucket: putInRightIndexedBucket(),
    getRoutingTable: getRoutingTable()
};

// Har vi allerede kontakten? Slet og append
// returner en bucket med nodes der har den definerede afstand
// Hvis man ikke har k-elementer i den bucket man ser på, skal jeg så se på den tidligere eller efter?
// Man skal altid returnere k elementer, hvis det er muligt.
// Når vi er ping'et, så skal vi placere afsenderen i den rigtige bucket.
