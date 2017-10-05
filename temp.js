//---------------------------------------- NODE FUNCTIONS ----------------------------------------\\
var values = [];



function storeValue(type, value) {
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    values.push({type: type, value:value, timeStamp:datetime});
}

/**
 * Løber iterativt igennem alle nodes for at finde en node.
 * @param nodeID
 */
function nodeLookup(nodeID, otherNodeID) {
    // Anvender findNode til at løbe igennem den modtagne liste iterativt
    var foundNode = false;
    var currentNode;
    var counter = 0;

    // containing the nodes, which have not been checked yet
    var notCheckedYet = [];
    var alreadyChecked = [];
    var results = [];
    var nodeFurthestAway;

    notCheckedYet = findNode(otherNodeID);

    //This node is the one to be replaced, if results contains k nodes
    nodeFurthestAway = notCheckedYet[0];

    while (counter < notCheckedYet.length) {
        currentNode = notCheckedYet[counter];

        // Checks the distance from our own ID to the current node's ID. Replaces nodeFurthestAway if the current ID is further away
        if (nodeID ^ nodeFurthestAway < nodeID ^ currentNode) {
            nodeFurthestAway = currentNode;
        }

        if (results.length == constants.k) {

        }

        // Moves the current Node from the notCheckedYet-list to the alreadyChecked-list
        alreadyChecked.push(currentNode);
        notCheckedYet.slice(notCheckedYet.indexOf(currentNode));
        counter++;

    }

}


var testList = [1233, 1010, 1345, 2359, 3247];
var testNodeID = 1234;

sortListByNumberClosestTo(testList, testNodeID);

function sortListByNumberClosestTo(list, nodeID) {
    // Custom defined sort function. Sorts the list after which nodeID is furthest away from the given nodeID
    return list.sort(function (a, b) {
        var a_XOR_NodeID = a ^ nodeID;
        var b_XOR_NodeID = b ^ nodeID;

        if (a_XOR_NodeID > b_XOR_NodeID) {return -1;}
        if (a_XOR_NodeID < b_XOR_NodeID) {return 1;}
        return 0;
    })
}