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
var values = [];

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
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// Able to return information about this peer
app.get('/api/node/info', function (req, res) {
    res.json({'nodeID': node.nodeID, 'port': port});
});

app.get('/api/node/routingTable', function (req, res) {
    res.send(routingTable);
});

// Able to return information about this peer
app.get('/api/node/values', function (req, res) {
    res.json(values);
});

//Post Request expecting nodeID and port in body
app.post('/api/node/ping', function (req, res) {
    var remote_nodeid = req.body['my_NodeID'];
    console.log("rem_nodeID", remote_nodeid);
    var remote_port = req.body['my_Port'];
    var my_nodeid = node.nodeID;
    console.log("PING");
    console.log("my_nodeid", my_nodeid);
    var distance = findDistanceBetweenNodes(my_nodeid, remote_nodeid);
    var rightIndex = utility.findMostSignificantBit(distance);
    console.log("Right Index: ", rightIndex);
    //Nul indeksering :)))
    var local_bucket = routingTable[rightIndex-1];
    addNodeTo(local_bucket, remote_nodeid, remote_port);
    console.log("RT AFTER PING: \n", routingTable);
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});
});

app.post('/api/node/findNode', function (req, res) {
    var remote_nodeid = req.body['my_NodeID'];
    console.log("findNode");
    console.log("remid", remote_nodeid);
    var my_nodeid = node.nodeID;
    console.log("locid", my_nodeid);
    var tempJSON = findNode(my_nodeid, remote_nodeid);
    console.log("TEMPJSON: ", tempJSON);
    res.json(tempJSON);
});

app.post('/api/node/nodeLookup', function (req, res) {
    var other_nodeid = req.body['target_NodeID'];
    var my_nodeid = node.nodeID;
    console.log("NODELOOKUP");
    console.log("mynodeid", my_nodeid);
    console.log("othernodeid", other_nodeid);
    var temp = nodeLookup(my_nodeid, other_nodeid);
    console.log("NL: \n", temp);
    res.send(".");
});

var server = app.listen(port, function () {
    var port = server.address().port;
    node = createNode();
    createBuckets();
    bootstrapNode();
    console.log('Server listening on http://localhost:' + port);
    storeValue("temp", "10c");
});

function createNode() {
    var nodeItem;
    var generatedNodeID = utility.createQuasi(8);
    if (nodeIDList.indexOf(generatedNodeID) == -1) {
        nodeIDList.push(generatedNodeID);
        nodeItem = new nodeClass.node(generatedNodeID, constants.ipAddress, port)
    }
    else {
        createNode()
    }
    return nodeItem;
}

function bootstrapNode(){
    if(arg_two == 0){
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

function findNodeInFile(otherID, otherPort) {
    var url = "http://localhost:" + otherPort + '/api/node/findNode';
    console.log(url);
    axios.post(url, {
        my_NodeID: otherID
    })
        .then(function (response) {
            return(response.data);u
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
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
    var indexOfTempNode = currentBucket.map(function(el) {
        return el.port
    }).indexOf(port);

    // If the element is not in the list
    if (indexOfTempNode < 0) {

        // If the bucket is full, ping to check for dead nodes
        if (currentBucket.length >= constants.k) {
            var deadNode = pingAllIdsInBucket(currentBucket);

            // If a pinged node doesn't respond, this node will be removed.
            if (deadNode !== null) {
                deleteNote(currentBucket, deadNode);
                currentBucket.push(tempNode);
            }
            console.log("Bucket is full and all nodes are alive.")
        }
        // If the bucket is not full, just push
        else {
            currentBucket.push(tempNode);
        }
    }
    else {
        // Remove the node and put it on top
        currentBucket.splice(indexOfTempNode, 1);
        //deleteNote(currentBucket, tempNode);
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
    return currentBucket.length == constants.k;
}

/**
 This method returns the first dead node it finds
 @param currentBucket
 */
function pingAllIdsInBucket(currentBucket) {
    if (nodeList.length > 0) {
        var counter = 0;
        var foundDeadNode = false;
        var deadNode;
        var currentNode;
        var url;

        //This function should ping all the IDs in the list until it finds a dead node
        while (counter < nodeList.length && foundDeadNode == false) {

            currentNode = currentBucket[counter];
            url = constants.ipAddress + currentNode.port; //The format is https://ipaddress/port


            // Connects to the defined url and checks if it exists or is dead
            axios.get(url)
                .then(function (response) {
                    console.log("success", response);
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
    return nodeID ^ otherNodeID;
}


/**
 *
 * @param myNodeID
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
        currentBucket = routingTable[bucketIndex + step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }

        currentBucket = routingTable[bucketIndex - step];
        // Går til venstre
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå til venstre, når der ikke er flere til højre for den nuværende bucket
    while (bucketIndex - step >= 0) {
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
        currentBucket = routingTable[bucketIndex + step];
        for (var y = 0; y < currentBucket.length; y++) {
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
    var hashedValue = crypto.createHash('sha1');
    //string-hash:
    hashedValue.update(value);
    console.log(hashedValue.digest('hex'));

    //Findnode på sig selv og valuen(hash)
    var neighborList = findNode(node.nodeID,hashedValue);

    //Brugbare variabler og lister
    var nodesToCheck = [];
    var checkedNodes = [];
    var counter = 0;
    var found = false;

    //Listen af de nærmeste nodes ud fra hash af value, lægges i listen af nodes der skal tjekkes
    nodesToCheck.extend(neighborList);
    // Tjekker sig selv for information/valuen, i så fald returner
    if(node.value == hashedValue){
        found = true;
        return node.value;
    }
    else{

    }
    // Tjekker de andre nodes for information/valuen, i så fald returner
    while(counter < nodesToCheck.length && found == false){
        //Hash the value
        //var hashedValue = crypto.createHash('sha1');
        //string-hash:
        //hashedValue.update(nodesToCheck[counter].nodeID);
        //console.log(hashedValue.digest('hex'));

        //if value[key]
        //return value
        //else
        //return findNode
        //Tjekker om vi allerede har tjekket denne node, hvis ja -> spring over denne node
        if(!checkedNodes.indexOf(nodesToCheck[counter])){
            for(var x = 0; x < nodesToCheck[counter].values.length; x++){
                if(nodesToCheck[counter].values[key] == hashedValue){
                    return nodesToCheck[counter].values[key];
                    //Mark sagde der skulle stå break
                    break;
                }
                else{
                    nodesToCheck.extend(findNode(nodesToCheck[counter]), hashedValue);
                    checkedNodes.append(nodesToCheck[counter]);
                    counter++;
                }
            }
        }
        else{

        }
    }
}

//---------------------------------------- NODE FUNCTIONS ----------------------------------------\\

function storeValue(type, value) {
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    values.push({type: type, value:value, timeStamp:datetime});
}

/**
 * Løber iterativt igennem alle nodes for at finde en node.
 * @param myNodeID
 */
function nodeLookup(myNodeID, otherNodeID) {
    // Anvender findNode til at løbe igennem den modtagne liste iterativt
    var foundNode = false;
    var currentNode;
    var counter = 0;

    // containing the nodes, which have not been checked yet
    var notCheckedYet = [];
    var alreadyChecked = [];
    var results = [];

    // Kalder findNode på sig selv
    notCheckedYet = findNode(myNodeID, otherNodeID);

    // Runs to the end of the list
    while (notCheckedYet.length != 0) {
        currentNode = notCheckedYet[counter];

        var indexOfNode = alreadyChecked.map(function(el) {
            return el.port;
        }).indexOf(currentNode.port);

        // If the node hasn't been looked at
        if (indexOfNode == -1) {
            console.log("FRIEDRICH VIL GERNE LOGGE HER :)))))");
            if (results.length == constants.k) {
                if (myNodeID ^ currentNode.nodeID < myNodeID ^ results[constants.k].nodeID) {
                    //Replace the last node in the list with the new one
                    results.splice(constants.k, 1, currentNode);
                }
            } else {
                results.push(currentNode);
            }

            var tempList = findNodeInFile(currentNode.nodeID, currentNode.port);

            // This list has to be run through, to see if it contains nodes, which has already been checked.
            for (var i = 0; i < tempList.length; i++) {
                // Has this node already been checked?
                if (alreadyChecked.indexOf(tempList[i]) < 0) {
                    notCheckedYet.push(tempList[i]);
                }
            }

            // Moves the current Node from the notCheckedYet-list to the alreadyChecked-list
            alreadyChecked.push(currentNode);
            notCheckedYet.shift();

        }

        results = sortListByNumberClosestTo(results, myNodeID);
        counter++;
    }
    return results;
}

/**
 * Sorts a given list depending on the distance between a given nodeID
 * and each listitem's nodeID XOR'ed.
 * LEAST DISTANCE AT INDEX 0
 * @param list
 * @param nodeID
 * @returns {Array.<T>}
 */
function sortListByNumberClosestTo(list, nodeID) {
    // Custom defined sort function. Sorts the list after which nodeID is furthest away from the given nodeID
    return list.sort(function (a, b) {
        var a_XOR_NodeID = a.nodeID ^ nodeID;
        var b_XOR_NodeID = b.nodeID ^ nodeID;

        if (a_XOR_NodeID < b_XOR_NodeID) {return -1;}
        if (a_XOR_NodeID > b_XOR_NodeID) {return 1;}
        return 0;
    })
}