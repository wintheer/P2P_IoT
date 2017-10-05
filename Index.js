var utility = require('./Utilities');
var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var path = require("path");
var nodeClass = require('./lib/Node');
var constants = require('./config/constants');
var app = express();
app.use(bodyParser.json());
var port = process.argv.slice(2)[0];
var arg_two = process.argv.slice(3)[0];
var node;
var nodeList = [];
var nodeIDList = [];
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
});

// Able to return information about this peer
app.get('/api/node/info', function (req, res, next) {
    res.json({'nodeID': node.nodeID, 'port': port});
});

app.get('/api/node/routingTable', function (req, res, next) {
    res.send(routingTable);
});

//Post Request expecting nodeID and port in body
app.post('/api/node/ping', function (req, res, next) {
    var remote_nodeid = req.body['my_NodeID'];
    console.log("rem_nodeID", remote_nodeid);
    var remote_port = req.body['my_Port'];
    var my_nodeid = node.nodeID;
    console.log("my_nodeid", my_nodeid);
    var distance = findDistanceBetweenNodes(my_nodeid, remote_nodeid);
    var rightIndex = utility.findMostSignificantBit(distance);
    var local_bucket = routingTable[rightIndex];
    addNodeTo(local_bucket, remote_nodeid, remote_port);
    console.log(routingTable);
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});
});

app.post('/api/node/findNode', function (req, res, next) {
    var remote_nodeid = req.body['my_NodeID'];
    var my_nodeid = node.nodeID;
    findNode(my_nodeid, remote_nodeid);
    res.send({'event': 'FIND_NODE', 'rem_nodeid': remote_nodeid, 'local_node': my_nodeid});
});

var server = app.listen(port, function () {
    var port = server.address().port;
    node = createNode();
    createBuckets();
    bootstrapNode();
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

function bootstrapNode(){
    if(arg_two === 0){
        console.log("First Node Started");
    }
    else
        targetedPing()
}

function targetedPing(){
    var url = "http://localhost:" + arg_two + '/api/node/ping';
    console.log();
    axios.post(url, {
        my_NodeID: node.nodeID,
        my_Port: node.port
    })
        .then(function (response) {
            //console.log("Targeted Ping", response);
            console.log("Targeted ping")
        })
        .catch(function (error) {
            //console.log("Something failed \n", error);
            console.log("error");
        });

}
//-------------------------------------------- BUCKET FUNCTIONS ---------------------------------------\\
/**
 * Adds a node with ID, port. Checks for duplicating element in list,
 * and updates the element, if it is there already
 * @param localNodeID
 * @param port
 * @param currentBucket
 */
function addNodeTo(currentBucket, localNodeID, port) {
    var tempNode = new nodeClass.node(localNodeID, constants.ipAddress, port);
    var indexOfTempNode = currentBucket.indexOf(tempNode);

    // If the element is not in the list
    if (indexOfTempNode >= 0) {

        if (currentBucket.length >= constants.k) {
            var deadNode = pingAllIdsInBucket(currentBucket);

            // If a pinged node doesn't respond, this node will be removed.
            if (deadNode !== null) {
                deleteNote(currentBucket, deadNode);
                currentBucket.push(tempNode);
            }
            console.log("Bucket is full and all nodes are alive.")
        }
        else {
            currentBucket.push(tempNode);
        }
    }
    else {
        deleteNote(currentBucket, tempNode);
        currentBucket.push(tempNode);
    }
}

/**
 * Deletes a given node from the bucket
 * @param currentBucket
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
 * @param currentBucket
 * @returns {boolean}
 */
function isBucketFull(currentBucket){
    return currentBucket.length === constants.k;
}

/**
 This method returns the first dead node it finds
 @param currentBucket
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
 * Finds the distance between two given nodes
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

/**
 *
 * @param otherNodeID
 * @returns {*}
 */
function findNode(myNodeID, otherNodeID) {
    var neighbourNodes;
    var bucketIndex = utility.findMostSignificantBit(findDistanceBetweenNodes(myNodeID, otherNodeID));
    var step = 1;
    var currentBucket;

    neighbourNodes = routingTable[bucketIndex];
    //console.log("NN", neighbourNodes);
    // Bliver ved med at gå til venstre og højre for den nuværende bucket og tilføjer nodes til foundnodes,
    // som er de tætteste naboer, går så længe der stadig er buckets tilbage
    while (bucketIndex + step < neighbourNodes.length && bucketIndex - step >= 0) {
        // Går til højre
        console.log("1");
        currentBucket = routingTable[bucketIndex + step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }

        currentBucket = routingTable[bucketIndex - step];
        // Går til venstre
        console.log("2");
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå til venstre, når der ikke er flere til højre for den nuværende bucket
    while (bucketIndex - step >= 0) {
        console.log("3");
        currentBucket = routingTable[bucketIndex - step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå fra bucket til bucket så længe der er flere tilbage
    while (bucketIndex + step < neighbourNodes.length) {
        console.log("3");
        currentBucket = routingTable[bucketIndex + step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    console.log("endNode", neighbourNodes);
    return neighbourNodes;

    //Find bucket index
    //Er den fuld?
    //Hvor meget plads har jeg?
    //Gå til højre, gå til venstre, hvis der er mere plads fortsæt
    //Slut af med at tage alt til venstre
    //Lav en liste af nodes og returnér.
}
function findValue(value){
    //Hash the value
    var shasum = crypto.createHash('sha1');
    //string-hash:
    shasum.update(value);
    console.log(shasum.digest('hex'));

    //Findnode på sig selv og valuen(hash)
    var neighborList = findNode(nodeID,shasum);

    //Brugbare variabler og lister
    var nodesToCheck = [];
    var checkedNodes = [];
    var counter = 0;
    var found = false;

    //Listen af de nærmeste nodes ud fra hash af value, lægges i listen af nodes der skal tjekkes
    nodesToCheck.extend(neighborList);
    // Tjekker sig selv for information/valuen, i så fald returner
    if(node.value == shasum){
        return node.value;
        found = true;
    }
    else{

    }
    // Tjekker de andre nodes for information/valuen, i så fald returner
    while(counter < nodesToCheck.length && found == false){
        //Hash the value
        //var shasum = crypto.createHash('sha1');
        //string-hash:
        //shasum.update(nodesToCheck[counter].nodeID);
        //console.log(shasum.digest('hex'));

        //if value[key]
        //return value
        //else
        //return findNode
        //Tjekker om vi allerede har tjekket denne node, hvis ja -> spring over denne node
        if(!checkedNodes.indexOf(nodesToCheck[counter])){
            for(x = 0; x < nodesToCheck[counter].values.length; x++){
                if(nodesToCheck[counter].values[key] == shasum){
                    return nodesToCheck[counter].values[key];
                    break;
                }
                else{
                    nodesToCheck.extend(findNode(nodesToCheck[counter]), shasum);
                    checkedNodes.append(nodesToCheck[counter]);
                    counter++;
                }
            }
        }
        else{

        }

    }
}
