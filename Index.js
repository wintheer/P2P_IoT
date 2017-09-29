var utility = require('./Utilities');
var express = require('express'), bodyParser = require('body-parser');
var constants = require('./config/constants');
var http = require('http');
var axios = require('axios');
//var routing = require('./RoutingTable');
//var routingTable = new routing();
var bucket = require('./bucket');
var app = express();
app.use(bodyParser.json());
var path = require("path");
var nodeClass = require('./lib/Node');
var port = process.argv.slice(2)[0];
var node;
var nodeID;
var nodeList = [];
var nodeIDList = [];
var buckets = [];
var routingTable = [];


//------------------------------------------ Server Functions -------------------------------------------------\\

// We need this to be able to call cross-origin, 
// which means that to different peers calling eachother 
// on different ports
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));
// For all of out routes we add next after res
// which then uses inheritance to allow all routes
// to get information from cross-origin calls
app.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

//Post Request expecting nodeID and port in body
app.post('/api/node/ping', function (req, res, next) {
    var remote_nodeid = req.body['nodeID'];
    var remote_port = req.body['port'];
    console.log('From noteid', remote_nodeid, 'port', remote_port);
    // Update Buckets
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});

    //buckets = routingTable.getRoutingTable();
    //buckets[routingTable.putInRightIndexedBucket].addNodeTo(remote_nodeid, remote_port);

});

// Able to return information about this peer
app.get('/api/node/info', function (req, res, next) {
    res.json({'nodeID': node.nodeID, 'port': port});
});

app.get('/api/node/routingTable', function (req, res, next) {
    //res.json({'nodeID': node.nodeID, 'port': port});
    res.send(routingTable);
});


var server = app.listen(port, function () {
    var port = server.address().port;
    node = createNode();
    nodeID = node.nodeID;




    createBuckets();

    //addNodeTo(219, 9952);
    //console.log("Added Node", nodeList);




    console.log('Server listening on http://localhost:' + port);
});

function createNode() {
    var nodeItem;
    var generatedNodeID = utility.createQuasi(8);
    if (nodeIDList.indexOf(generatedNodeID) === -1) {
        nodeIDList.push(generatedNodeID);
        nodeItem = new nodeClass.node(generatedNodeID, constants.ipAddress, port)
    }
    else {
        createNode()
    }
    return nodeItem;
}

var getThisNodeID = function () {
    return nodeID;
};

var getThisNodePort = function () {
    return port;
};

module.exports = {
    getThisNodeID: getThisNodeID(),
    getThisNodePort: getThisNodePort()
};

//-------------------------------------------- BUCKET FUNCTIONS ---------------------------------------\\
/**Adds a node with ID, Port and IP
 *
 * @param nodeID
 * @param Port
 */
function addNodeTo(currentBucket, nodeID, Port) {
    var tempNode;
    if (currentBucket.length >= constants.k) {
        var deadNode = pingAllIdsInBucket(currentBucket);

        // If a pinged node doesn't respond, this node will be removed.
        if (deadNode !== null) {
            deleteNote(deadNode);
            tempNode = new nodeClass.node(nodeID, constants.ipAddress, Port);
            currentBucket.push(tempNode);
        }
        console.log("Bucket is full and all nodes are alive.")
    }
    else {
        tempNode = new nodeClass.node(nodeID, constants.ipAddress, Port);
        currentBucket.push(tempNode);
    }
}

/**
 * Deletes a given node from the bucket
 * @param node
 */
function deleteNote(currentBucket, node) {
    //Only removes the node, if it's in the array
    var index = currentBucket.indexOf(node);
    if (index !== 0) {
        currentBucket.splice(index, 1);
    }
}

/**
 * Checks if the given bucket is full
 * @returns {boolean}
 */
function isBucketFull(currentBucket){
    return currentBucket.length === constants.k;
}

/**
 This method returns the first dead node it finds
 */
function pingAllIdsInBucket(currentBucket) {
    if (nodeList.length > 0){
        var counter = 0;
        var foundDeadNode = false;
        var deadNode;
        var currentNode;
        var url;

        //This function should ping all the IDs in the list until it finds a dead node
        while(counter < nodeList.length && foundDeadNode == false) {

            currentNode = currentBucket[counter];
            url = constants.ipAddress + currentNode.port; //The format is https://ipaddress/port


            // Connects to the defined url and checks if it exists or is dead
            axios.get(url)
                .then(function (response) {
                    console.log("success",response);
                    counter++
                })
                .catch(function (error) {
                    console.log(error);
                    foundDeadNode = true;
                    deadNode = nodeList[counter];
                });
        }

        //Returns the dead node if there has been found one
        return deadNode;
    }
}



//---------------------------------------- ROUTING TABLE FUNCTIONS -------------------------------------\\



/**
 * Creates k buckets
 */
function createBuckets() {
    for(var i = 0; i < constants.k; i++) {
        var tempArray = [];
        routingTable.push(tempArray);
    }
}

/**
 *
 * @param nodeID
 * @param otherNodeID
 * @returns {number}
 */
function findDistanceBetweenNodes(nodeID, otherNodeID) {
    var distance = nodeID ^ otherNodeID;
    return distance;
}


/**
 * Puts the given nodeID with the given distance from this node in the right bucket index
 */
function putInRightIndexedBucket(otherNodeID, otherNodePort) {
    var localIndex = utility.findMostSignificantBit(findDistanceBetweenNodes(nodeID, otherNodeID));
    var currentBucket = routingTable[localIndex];

    // If the bucket is full, it will ping all it's notes to see, if can switch it out with the new node
    if(isBucketFull(currentBucket)) {
        pingAllIdsInBucket(currentBucket);
    }
    else {
        addNodeTo(routingTable[localIndex], otherNodeID, otherNodePort)

    }
}

function findNode(otherNodeID) {
    var neighbourNodes;
    var bucketIndex = utility.findMostSignificantBit(findDistanceBetweenNodes(nodeID, otherNodeID));
    var step = 1;

    neighbourNodes = routingTable[bucketIndex];
    // Bliver ved med at gå til venstre og højre for den nuværende bucket og tilføjer nodes til foundnodes,
    // som er de tætteste naboer, går sålænge der stadig er buckets tilbage
    while (bucketIndex + step < neighbourNodes.length() && bucketIndex - step >= 0) {
        // Går til højre
        for (y = 0; y < routingTable[bucketIndex + step].length(); y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(bucket[y]);
            }
        }

        // Går til venstre
        for (y = 0; y < routingTable[bucketIndex - step].length(); y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå til venstre, når der ikke er flere til højre for den nuværende bucket
    while (bucketIndex - step >= 0) {
        for (y = 0; y < routingTable[bucketIndex - step].length(); y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå fra bucket til bucket så længe der er flere tilbage
    while (bucketIndex + step < neighbourNodes.length()) {
        for (y = 0; y < routingTable[bucketIndex + step].length(); y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(bucket[y]);
            }
        }
        step++;
    }
    return neighbourNodes;

    //Find bucket index
    //Er den fuld?
    //Hvor meget plads har jeg?
    //Gå til højre, gå til venstre, hvis der er mere plads fortsæt
    //Slut af med at tage alt til venstre
    //Lav en liste af nodes og returnér.
}
