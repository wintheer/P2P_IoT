
var constants = require('./../config/constants');


function Bucket() {
    this.nodeList = [];
}



/**
 * Function for organizing contacts, other nodes known, in buckets which hold a maximum of k contacts (k-buckets).
 */
Bucket.prototype.sortBucket = function () {
    //Should sort the bucket after..
};

function isBuckedFull() {
    if(this.nodeList.length === constants.k) {
        return true;
    }
    return false;
}

Bucket.prototype.addNode = function(nodeID) {
    this.nodeList.push(nodeID);
};

/**
 * Deletes a given node from the bucket
 * @param node
 */
function deleteNote(node) {
    var index = this.getNodeIndex(node);
    //Only removes the node, if it's in the array
    if (index !== 0) {
        this.nodeList.splice(index, 1);
    }
}

function getNodeIndex(node) {
    for(i = 0; i < this.nodeList.length; i++){
        if (this.nodeList[i].id === node.id){
            return i;
        }
        return 0;
    }
}
