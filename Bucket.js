
var https = require('https');

var constants = require('./config/constants');

var nodeList;


function Bucket() {
    nodeList = [];
}


Bucket.prototype.isBucketFull = function(){
    return nodeList.length === constants.k;
};

// Adds a node with ID, Port and IP
Bucket.prototype.addNode = function(nodeID, Port) {
    if (nodeList.length >= constants.k) {
        var deadNode = pingAllIdsInBucket();

        // If a pinged node doesn't respond, this node will be removed.
        if (deadNode != null) {
            deleteNote(deadNode);
            nodeList.push(new Node(nodeID, constants.ipAddress, Port));
        }
        console.log("Bucket is full and all nodes are alive.")
    }
    else {
        nodeList.push(new Node(nodeID, constants.ipAddress, Port));
    }
};

/**
 * Deletes a given node from the bucket
 * @param node
 */
function deleteNote(node) {
    var index = getNodeIndex(node);
    //Only removes the node, if it's in the array
    if (index !== 0) {
        nodeList.splice(index, 1);
    }
}

function getNodeIndex(node) {
    return nodeList.indexOf(node);
}

// This method returns the first dead node it finds
function pingAllIdsInBucket() {
    var counter = 0;
    var foundDeadNode = false;
    var deadNode;
    var currentNode = nodeList[counter];


    //This function should ping all the IDs in the list until it finds a dead node
    if(counter < nodeList.length && foundDeadNode == false) {   //Skal det ikke være en While løkke eller en for-løkke?
        //The format is https://ipaddress/port/nodeID
        https.get(constants.ipAddress + currentNode.port + '/' + currentNode.nodeID , function(parameters) {
            var res = parameters.res;

            if (res == 200) {
                counter++
            }

            else {
                foundDeadNode = true;
                deadNode = nodeList[counter];
            }
        });
    }

    //Returns the dead node if there has been found one
    return deadNode;
}

