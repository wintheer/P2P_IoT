var https = require('https');
var nodeClass = require("./lib/Node");

var constants = require('./config/constants');

var nodeList;

function Bucket() {
    nodeList = []
}

Bucket.prototype
var isBucketFull = function(){
    return nodeList.length === constants.k;
};

// This method returns the first dead node it finds
var pingAllIdsInBucket = function() {
    if (nodeList.length > 0){
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
};

