/**
 * This class consists of a multidimensional array, meaning it's an array containing arrays
 * To be precise it contains k-arrays which here is referred to as k-buckets, each containing
 * k nodes
 */

//var constants = require('../../Downloads/P2P_IoT-master/P2P_IoT-master/config/constants');
var bucket = require('./Bucket');
//var index = require('../../Downloads/P2P_IoT-master/P2P_IoT-master/Index');
var utilities = require('./Utilities');

var routingTable = [];

function RoutingTable() {
    createBuckets();
}


// Creates k-buckets
RoutingTable.prototype.createBuckets = function() {
    for(var i = 0; i < constants.k; i++){
        routingTable.push(new bucket());
    }
};

function findDistanceBetweenNodes(nodeID, otherNodeID) {
    return distance = nodeID ^ otherNodeID;
}

/**
 * Puts the given nodeID with the given distance from this node in the right bucket index
 */
function putInRightIndexedBucket(otherNodeID) {
    var index = utilities.findMostSignificantBit(findDistanceBetweenNodes(index.getNodeID(), otherNodeID));
    var currentBucket = routingTable[index];

    // If the bucket is full, it will ping all it's notes to see, if can switch it out with the new node
    if(currentBucket.isBucketFull) {
        currentBucket.pingAllIdsInBucket();
    }
    else {
        routingTable[index].addNode(otherNodeID);
    }
}

//Når ping er kaldet
function addPeer(otherNode) {
    // What is the other Node's ID?
    var otherNodeID = otherNode.nodeID;
    // Which bucket to look in?
    var currentBucket = utilities.findMostSignificantBit(findDistanceBetweenNodes(otherNodeID));
    //Indeholder jeg allerede denne peer?
    if(routingTable[currentBucket].indexOf(otherNode)) {
        //Slet dette element og erstat med det samme objekt
    }

    //putInRightIndexedBucket skal kaldes her

}


function findNode(otherNodeID) {
    var neighbourNodes;
    var bucketIndex = utilities.findMostSignificantBit(findDistanceBetweenNodes(index.getNodeID(), otherNodeID));
    var step = 1;
    neighbourNodes = routingTable[bucketIndex];
    // Bliver ved med at gå til venstre og højre for den nuværende bucket og tilføjer nodes til foundnodes,
    // som er de tætteste naboer, går sålænge der stadig er buckets tilbage
    while(bucketIndex + step < neighbourNodes.length() && bucketIndex - step >= 0){
        // Går til højre
        for (y = 0; y < routingTable[bucketIndex + step].length(); y++) {
            if(neighbourNodes.length < constants.k){
                neighbourNodes.push(bucket[y]);
            }
        }

        // Går til venstre
        for (y = 0; y < routingTable[bucketIndex - step].length(); y++) {
            if(neighbourNodes.length < constants.k){
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå til venstre, når der ikke er flere til højre for den nuværende bucket
    while(bucketIndex - step >= 0){
        for (y = 0; y < routingTable[bucketIndex - step].length(); y++) {
            if(neighbourNodes.length < constants.k){
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå fra bucket til bucket så længe der er flere tilbage
    while(bucketIndex + step < neighbourNodes.length()){
        for (y = 0; y < routingTable[bucketIndex + step].length(); y++) {
            if(neighbourNodes.length < constants.k){
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }

    //Find bucket index
    //Er den fuld?
    //Hvor meget plads har jeg?
    //Gå til højre, gå til venstre, hvis der er mere plads fortsæt
    //Slut af med at tage alt til venstre
    //Lav en liste af nodes og returnér.
    return neighbourNodes;
}

// Har vi allerede kontakten? Slet og append
// returner en bucket med nodes der har den definerede afstand
// Hvis man ikke har k-elementer i den bucket man ser på, skal jeg så se på den tidligere eller efter?
// Man skal altid returnere k elementer, hvis det er muligt.
// Når vi er ping'et, så skal vi placere afsenderen i den rigtige bucket.