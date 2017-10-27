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
var tempList = [];
var alreadyChecked = [];
var results = [];
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
    console.log("________________________________");
    console.log("Ping: P");
    var remote_nodeid = req.body['my_NodeID'];
    console.log("P: rem_id", remote_nodeid);
    var remote_port = req.body['my_Port'];
    console.log("P: rem_port", remote_port);
    var my_nodeid = node.nodeID;
    console.log("P: loc_id", my_nodeid);
    var distance = findDistanceBetweenNodes(my_nodeid, remote_nodeid);
    var rightIndex = utility.findMostSignificantBit(distance);
    //console.log("Right Index: ", rightIndex);
    //Nul indeksering :)))
    var local_bucket = routingTable[rightIndex-1];
    addNodeTo(local_bucket, remote_nodeid, remote_port);
    console.log("P: RT \n", routingTable);
    console.log("P: Ended.");
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});
});

app.post('/api/node/findNode', function (req, res) {
    console.log("Find Node: FN");
    var remote_nodeid = req.body['my_NodeID'];
    console.log("FN: rem_id", remote_nodeid);
    var my_nodeid = node.nodeID;
    console.log("FN: loc_id", my_nodeid);
    var tempJSON = findNode(my_nodeid, remote_nodeid);
    console.log("FN RESULT", tempJSON);
    console.log("FN: RT: ", routingTable);
    console.log("FN: Ended.");
    res.json(tempJSON);
});

app.post('/api/node/nodeLookup', function (req, res) {
    var other_nodeid = req.body['target_NodeID'];
    var my_nodeid = node.nodeID;
    console.log("Node Lookup: NL");
    //console.log("NL: loc_id", my_nodeid);
    //console.log("NL: rem_id", other_nodeid);
    var temp = nodeLookup(my_nodeid, other_nodeid);
    setTimeout(function () {
        console.log("NL: Lookup result for node\n", node.port, temp);
        console.log("NL: Ended.");
        res.send(temp);
    }, 1000);
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

function bootstrapNode() {
    if (arg_two == 0) {
        console.log("First Node Started");
    }
    else
        targetedPing();
}

function targetedPing() {
    var url = "http://localhost:" + arg_two + '/api/node/ping';
    axios.post(url, {
        my_NodeID: node.nodeID,
        my_Port: node.port
    })
        .then(function (response) {
            console.log("targeted ping response", response.data);
            console.log("Targeted ping");
            var distance = findDistanceBetweenNodes(node.nodeID, response.data.nodeID);
            var rightIndex = utility.findMostSignificantBit(distance);
            //console.log("Right Index: ", rightIndex);
            //Nul indeksering :)))
            var local_bucket = routingTable[rightIndex - 1];
            addNodeTo(local_bucket, response.data.nodeID, response.data.port);
        })
        .catch(function (error) {
            //console.log("Something failed \n", error);
            console.log("error targPing");
        });
}

function argumentPing(argument_id, argument_port) {
    var url = "http://localhost:" + argument_port + '/api/node/ping';
    axios.post(url, {
        my_NodeID: argument_id,
        my_Port: node.port
    })
        .then(function (response) {
            //console.log("Argument Ping", response);
            console.log("Argument ping");
            console.log("I ", node.port, " pinged ", argument_port);
        })
        .catch(function (error) {
            //console.log("Something failed \n", error);
            console.log("error argPing", argument_port);
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
    console.log("cb", currentBucket, "lni", localNodeID, "port", port);
    var tempNode = new nodeClass.node(localNodeID, constants.ipAddress, port);
    var indexOfTempNode;
    var bucketLength = 0;
    if (typeof currentBucket == 'undefined') {
        indexOfTempNode = -1;
    } else {
        indexOfTempNode = currentBucket.map(function (el) {
            return el.port
        }).indexOf(port);
        bucketLength = currentBucket.length;
    }

    if (port != node.port) {
        // If the element is not in the list
        if (indexOfTempNode < 0) {

            // If the bucket is full, ping to check for dead nodes
            if (bucketLength >= constants.k) {
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
}

/**
 * Can add unlimited elements to a list without them being
 * @param list
 * @param nodeID
 * @param nodePort
 * @returns {*}
 */
function unlimitedAddTo(list, nodeID, nodePort) {
    if (nodeID != node.nodeID) {
        var indexOfTempNode;
        var tempNode = new nodeClass.node(nodeID, constants.ipAddress, nodePort);
        if (typeof list == 'undefined') {
            indexOfTempNode = -1;
        } else {
            indexOfTempNode = list.map(function (el) {
                return el.port
            }).indexOf(nodePort);
        }

        if (indexOfTempNode == -1) {
            return list.push(tempNode);
        }
    }
    return false;
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
function isBucketFull(currentBucket) {
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
    for (var i = 0; i < constants.k; i++) {
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
    console.log("Find Node started, on self:", node.port);

    var neighbourNodes = [];
    var bucketIndex = utility.findMostSignificantBit(findDistanceBetweenNodes(myNodeID, otherNodeID));
    console.log("mni", myNodeID);
    console.log("oni", otherNodeID);
    var step = 1;
    var currentBucket = [];
    console.log("before concat", neighbourNodes);
    console.log("rtbi", routingTable[bucketIndex]);
    console.log("rtbi", routingTable[bucketIndex-1]);
    console.log("bi", bucketIndex);
    neighbourNodes = neighbourNodes.concat(routingTable[bucketIndex]);
    console.log("start NN", neighbourNodes);
    // Bliver ved med at gå til venstre og højre for den nuværende bucket og tilføjer nodes til foundnodes,
    // som er de tætteste naboer, går så længe der stadig er buckets tilbage
    while (bucketIndex + step < constants.k && bucketIndex - step >= 0) {
        // Går til højre
        currentBucket = routingTable[bucketIndex + step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                console.log("1");
                neighbourNodes.push(currentBucket[y]);
            }
        }

        currentBucket = routingTable[bucketIndex - step];
        // Går til venstre
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                console.log("2");
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
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                console.log("3");
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå fra bucket til bucket så længe der er flere tilbage
    while (bucketIndex + step < constants.k) {
        currentBucket = routingTable[bucketIndex + step];
        console.log("bucket in 4", currentBucket);
        for (var y = 0; y < currentBucket.length; y++) {
            console.log("bucket in 5", currentBucket);
            if (neighbourNodes.length < constants.k) {
                console.log("bucket in 6", currentBucket);
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                console.log("4");
                console.log("4....", currentBucket[y-1],"mellemrum", currentBucket[y]);
                console.log("cb before NN add", currentBucket[y]);
                console.log("NN before", neighbourNodes);
                neighbourNodes.push(currentBucket[y]);
                console.log("NN", neighbourNodes);

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


function findValue(value) {
    //Hash the value
    var hashedValue = crypto.createHash('sha1');
    //string-hash:
    hashedValue.update(value);
    console.log(hashedValue.digest('hex'));

    //Findnode på sig selv og valuen(hash)
    var neighborList = findNode(node.nodeID, hashedValue);

    //Brugbare variabler og lister
    var nodesToCheck = [];
    var checkedNodes = [];
    var counter = 0;
    var found = false;

    //Listen af de nærmeste nodes ud fra hash af value, lægges i listen af nodes der skal tjekkes
    nodesToCheck.extend(neighborList);
    // Tjekker sig selv for information/valuen, i så fald returner
    if (node.value == hashedValue) {
        found = true;
        return node.value;
    }
    else {

    }
    // Tjekker de andre nodes for information/valuen, i så fald returner
    while (counter < nodesToCheck.length && found == false) {
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
        if (!checkedNodes.indexOf(nodesToCheck[counter])) {
            for (var x = 0; x < nodesToCheck[counter].values.length; x++) {
                if (nodesToCheck[counter].values[key] == hashedValue) {
                    return nodesToCheck[counter].values[key];
                    //Mark sagde der skulle stå break
                    break;
                }
                else {
                    nodesToCheck.extend(findNode(nodesToCheck[counter]), hashedValue);
                    checkedNodes.append(nodesToCheck[counter]);
                    counter++;
                }
            }
        }
        else {

        }
    }
}

//---------------------------------------- NODE FUNCTIONS ----------------------------------------\\

function storeValue(type, value) {
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    values.push({type: type, value: value, timeStamp: datetime});
}

/**
 * Løber iterativt igennem alle nodes for at finde en node.
 * @param myNodeID
 */
function nodeLookup(myNodeID, otherNodeID) {
    tempList = [];
    console.log("NodeLookup started, internal");
    // Anvender findNode til at løbe igennem den modtagne liste iterativt
    var foundNode = false;
    var currentNode;
    // containing the nodes, which have not been checked yet
    var notCheckedYet = [];

    // Kalder findNode på sig selv
    notCheckedYet = findNode(myNodeID, otherNodeID);
    alreadyChecked.push(node);
    currentNode = notCheckedYet[0];

    // Callback function
    console.log("First call of RFN", currentNode);
    tempListCounter = 0;
    recursiveFindNode(otherNodeID, currentNode);
    // This list has to be run through, to see if it contains nodes, which has already been checked.
    // Moves the current Node from the notCheckedYet-list to the alreadyChecked-list
    alreadyChecked.push(currentNode);
    console.log("NLU end", results);
    return results;
}

function nlFindNode(otherNodeID, currentNode, callback) {
    var url = "http://localhost:" + currentNode.port + '/api/node/findNode';
    console.log('ENTERED FNIF', url);
    return axios.post(url, {
        my_NodeID: otherNodeID
    })
        .then(function (response) {
            console.log("nlFindNode called from", currentNode);
            /*
            if (response.data != null) {
                argumentPing(otherNodeID, currentNode.port);
            }*/
            console.log("nlFindNode response data", response.data);
            for (var j = 0; j < response.data.length; j++) {
                var tempNodeID = response.data[j].nodeID;
                var tempNodePort = response.data[j].port;
                unlimitedAddTo(tempList, tempNodeID, tempNodePort);
            }
            console.log("templist in nlFN", tempList);
            callback(response.data);
        })
        .catch(function (error) {
            console.log("Something failed in nlFindNode\n", error);
            console.log("nlFindNode error node", currentNode);
        });
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

        if (a_XOR_NodeID < b_XOR_NodeID) {
            return -1;
        }
        if (a_XOR_NodeID > b_XOR_NodeID) {
            return 1;
        }
        return 0;
    })
}

//TODO FILTER ALL JSON IN MAGICAL LOOP :)
var tempListCounter = 0;

function recursiveFindNode(method_OtherNodeID, method_CurrentNode) {
    console.log("_________________________________________________________");
    console.log("RFN started");
    console.log("RFN: Current Node", method_CurrentNode);
    var indexOfNode = alreadyChecked.map(function (el) {
        return el.port;
    }).indexOf(method_CurrentNode.port);
    if (indexOfNode == -1) {
        unlimitedAddTo(alreadyChecked, method_CurrentNode.nodeID, method_CurrentNode.port);
        nlFindNode(method_OtherNodeID, method_CurrentNode, function (res) {
            res.forEach(function (item) {
                if (item == null) {
                    console.log("item null return", method_CurrentNode);
                    results.push(method_CurrentNode);
                    results = sortListByNumberClosestTo(results, node.nodeID);
                    return;
                }
                var tempNodeID = item.nodeID;
                var tempNodePort = item.port;

                unlimitedAddTo(tempList, tempNodeID, tempNodePort);
                console.log("new node", tempNodeID, tempNodePort);
                console.log("rfNNNNNNN_______________ ", tempList);
                if (results.length == constants.k) {
                    console.log("Look in nodelookup if you found a problem here");
                    if (method_OtherNodeID ^ method_CurrentNode.nodeID < method_OtherNodeID ^ results[constants.k - 1].nodeID) {
                        //Replace the last node in the list with the new one
                        results.pop();
                        //console.log("results full pre", results);
                        addNodeTo(results, tempNodeID, tempNodePort);
                        results = sortListByNumberClosestTo(results, node.nodeID);
                        //console.log("results full post", results);
                    }
                }
                else {
                    //console.log("results pre", results);
                    //console.log("we put this node in results", tempNodePort);
                    addNodeTo(results, tempNodeID, tempNodePort);
                    results = sortListByNumberClosestTo(results, node.nodeID);
                    //console.log("results post", results);
                }
            });
            tempListCounter++;
            if (tempListCounter - 1 < tempList.length) {
                //console.log("CALLING RECURSIVE FIND NODE ON", tempList[tempListCounter-1]);
                //console.log("tempList before new recursive call", tempList);
                //console.log("templistcounter", tempListCounter);
                recursiveFindNode(method_OtherNodeID, tempList[tempListCounter-1]);
            }
            else{
                for(var z = 0; z < tempList.length, z++;){
                    console.log("pinging z", z);
                    argumentPing(tempList[z].nodeID, tempList[z].port);
                }
            }
        });

    }
    //TODO look at templistcounter
    else {
        console.log("couldn't find any unchecked nodes", tempList);
    }
}
