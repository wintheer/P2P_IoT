var utility = require('./Utilities');
var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var path = require("path");
var nodeClass = require('./lib/Node');
var constants = require('./config/constants');
var crypto = require('crypto');
var jq = require('jquery');
var app = express();
app.use(bodyParser.json());
var port = process.argv.slice(2)[0];
var arg_two = process.argv.slice(3)[0];
var node;
var nodeList = [];
var nodeIDList = [];
var routingTable = [];
var valueMap = {};
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
    console.log("they took our values");
    res.json(valueMap);
});

app.post('/api/node/values/findValue', function (req, res) {
    var keyToFind = req.body['key'];
    console.log("value before", valueMap);
    nodeLookup(node.nodeID, node.nodeID, function () {
        console.log("temp in router", tempList);
        console.log("we fill tempList");
        var q;
        findValue(keyToFind, tempList, function (les) {
            console.log
            q = les;
            res.send(q);
        });
    });
});

app.post('/api/node/values/replicate', function (req, res) {
    console.log("________________________________");
    console.log("Replicate R");7
    //hvad i alverden er formålet med den her variabel?????
    var otherID = req.body['otherID'];
    //this one is already hashed, what to do?
    var key = req.body['key'];
    var type = req.body['type'];
    var value = req.body['value'];
    console.log("R:", "OtherID", otherID, "Key", key, "Type", type, "Value", value);
    storeValueInFile(key, type, value, false, false);
    console.log("valueMap", valueMap);
    res.send("R: Store value on " + node.port.toString() + " successful");
});

//Post Request expecting nodeID and port in body
app.post('/api/node/ping', function (req, res) {
    console.log("________________________________");
    console.log("Ping: P");
    var remote_nodeid = req.body['my_NodeID'];
    var remote_port = req.body['my_Port'];
    var my_nodeid = node.nodeID;
    console.log("P: loc_id", my_nodeid, "loc_port", node.port, "rem_id", remote_nodeid, "rem_port", remote_port);
    var distance = findDistanceBetweenNodes(my_nodeid, remote_nodeid);
    var rightIndex = utility.findMostSignificantBit(distance);
    //Nul indeksering :)))
    var local_bucket;
    local_bucket = routingTable[rightIndex];
    addNodeTo(local_bucket, remote_nodeid, remote_port);
    console.log("P: RT \n", routingTable);
    console.log("P: Ended.");
    console.log("________________________________");
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});
});

app.post('/api/node/findNode', function (req, res) {
    console.log("________________________________");
    console.log("Find Node: FN");
    var remote_nodeid = req.body['my_NodeID'];
    var my_nodeid = node.nodeID;
    console.log("FN:", "loc_id", my_nodeid, "rem_id", remote_nodeid);
    var tempJSON = findNode(my_nodeid, remote_nodeid);
    console.log("FN RESULT", tempJSON);
    //console.log("FN: RT: ", routingTable);
    console.log("FN: Ended.");
    console.log("________________________________");
    res.json(tempJSON);
});

app.post('/api/node/nodeLookup', function (req, res) {
    var other_nodeid = req.body['target_NodeID'];
    var my_nodeid = node.nodeID;
    console.log("Node Lookup: NL");
    //console.log("NL: loc_id", my_nodeid);
    //console.log("NL: rem_id", other_nodeid);
    var temp;
    nodeLookup(my_nodeid, other_nodeid, function (ret) {
        temp = ret;
        console.log("NL: Lookup result for node\n", node.port, temp);
        console.log("NL: Ended.");
        res.send(temp);
    });
});

var server = app.listen(port, function () {
    var port = server.address().port;
    node = createNode();
    createBuckets();
    bootstrapNode();
    console.log('Server listening on http://localhost:' + port);
    console.log("nodeID", node.nodeID, "Port", node.port);
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
        storeValueInFile(1, "112", "Horsie", 14, false, true);
        storeValueInFile(1, "113", "Horsie", 14, false, true);
        console.log(Object.keys(valueMap).length);
        console.log(valueMap);
    }
    else if (arg_two == 8890) {
        targetedPing();
        storeValueInFile(1, "200", "Horsie", 200, false, true);
        storeValueInFile(1, "700", "Horsie", 700, false, true);

    }
    else {
        targetedPing()
    }

}

function targetedPing() {
    var url = "http://localhost:" + arg_two + '/api/node/ping';
    axios.post(url, {
        my_NodeID: node.nodeID,
        my_Port: node.port
    })
        .then(function (response) {
            console.log("targeted ping", response.data);
            var distance = findDistanceBetweenNodes(node.nodeID, response.data.nodeID);
            var rightIndex = utility.findMostSignificantBit(distance);
            //console.log("Right Index: ", rightIndex);
            //Nul indeksering :)))
            var local_bucket = routingTable[rightIndex - 1];
            addNodeTo(local_bucket, response.data.nodeID, response.data.port);
        })
        .catch(function (error) {
            console.log("error targPing", error);
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
            //console.log("Argument ping");
            console.log("I ", node.port, " pinged ", argument_port);
            var distance = findDistanceBetweenNodes(node.nodeID, response.data.nodeID);
            var rightIndex = utility.findMostSignificantBit(distance);
            //console.log("Right Index: ", rightIndex);
            //Nul indeksering :)))
            var local_bucket = routingTable[rightIndex - 1];
            addNodeTo(local_bucket, response.data.nodeID, response.data.port)
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
    //console.log("cb", currentBucket, "lni", localNodeID, "port", port);
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
    //console.log("Find Node started, on self:", node.port);

    var neighbourNodes = [];
    var bucketIndex = utility.findMostSignificantBit(findDistanceBetweenNodes(myNodeID, otherNodeID));
    var step = 1;
    var currentBucket = [];
    neighbourNodes = neighbourNodes.concat(routingTable[bucketIndex]);
    // Bliver ved med at gå til venstre og højre for den nuværende bucket og tilføjer nodes til foundnodes,
    // som er de tætteste naboer, går så længe der stadig er buckets tilbage
    while (bucketIndex + step < constants.k && bucketIndex - step >= 0) {
        // Går til højre
        currentBucket = routingTable[bucketIndex + step];
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                neighbourNodes.push(currentBucket[y]);
            }
        }

        currentBucket = routingTable[bucketIndex - step];
        // Går til venstre
        for (y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
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
                neighbourNodes.push(currentBucket[y]);
            }
        }
        step++;
    }
    // Bliver ved med at gå fra bucket til bucket så længe der er flere tilbage
    while (bucketIndex + step < constants.k) {
        currentBucket = routingTable[bucketIndex + step];
        for (var y = 0; y < currentBucket.length; y++) {
            if (neighbourNodes.length < constants.k) {
                addNodeTo(currentBucket, currentBucket[y].nodeID, currentBucket[y].port);
                neighbourNodes.push(currentBucket[y]);
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

//---------------------------------------- NODE FUNCTIONS ----------------------------------------\\

function storeValue(type, value) {
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    valueMap.push({type: type, value: value, timeStamp: datetime});
}

/**
 * Løber iterativt igennem alle nodes for at finde en node.
 * @param myNodeID
 */
function nodeLookup(myNodeID, otherNodeID, callback) {
    console.log("NL Started");
    tempList = [];
    //console.log("NodeLookup started, internal");
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
    //console.log("First call of RFN", currentNode);
    tempListCounter = 0;

    recursiveFindNode(otherNodeID, currentNode, function (res) {
        callback(res);
    });
    // This list has to be run through, to see if it contains nodes, which has already been checked.
    // Moves the current Node from the notCheckedYet-list to the alreadyChecked-list
    alreadyChecked.push(currentNode);

}

function nlFindNode(otherNodeID, currentNode, callback) {
    var url = "http://localhost:" + currentNode.port + '/api/node/findNode';
    //console.log('ENTERED FNIF', url);
    return axios.post(url, {
        my_NodeID: otherNodeID
    })
        .then(function (response) {
            //console.log("nlFindNode called from", currentNode);

            if (response.data != null) {
                //console.log("argument ping", currentNode.port);
                argumentPing(otherNodeID, currentNode.port);
            }
            //console.log("nlFindNode response data", response.data);
            for (var j = 0; j < response.data.length; j++) {
                var tempNodeID = response.data[j].nodeID;
                var tempNodePort = response.data[j].port;
                unlimitedAddTo(tempList, tempNodeID, tempNodePort);
            }
            //console.log("templist in nlFN", tempList);
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
 * SMALLEST DISTANCE AT INDEX 0
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

function recursiveFindNode(method_OtherNodeID, method_CurrentNode, callback) {
    console.log("_________________________________________________________");
    console.log("RFN started on", method_CurrentNode);
    var indexOfNode = alreadyChecked.map(function (el) {
        return el.port;
    }).indexOf(method_CurrentNode.port);
    if (indexOfNode == -1) {
        //console.log("templistdebug: counter", tempListCounter, "list", tempList.length);
        //console.log("alreadyChecked",alreadyChecked);
        unlimitedAddTo(alreadyChecked, method_CurrentNode.nodeID, method_CurrentNode.port);
        //console.log("calling nlFIndNode from", method_CurrentNode);
        nlFindNode(method_OtherNodeID, method_CurrentNode, function (res) {
            console.log("rfn", res);
            res.forEach(function (item) {
                if (item == null) {
                    //console.log("item null return", method_CurrentNode);
                    results.push(method_CurrentNode);
                    results = sortListByNumberClosestTo(results, node.nodeID);
                }
                var tempNodeID = item.nodeID;
                var tempNodePort = item.port;

                unlimitedAddTo(tempList, tempNodeID, tempNodePort);
                //console.log("new node", tempNodeID, tempNodePort);
                //console.log("rfNNNNNNN_______________ ", tempList);
                if (results.length == constants.k) {
                    console.log("Look in nodelookup if you found a problem here");
                    if (method_OtherNodeID ^ method_CurrentNode.nodeID < method_OtherNodeID ^ results[constants.k - 1].nodeID) {
                        //Replace the last node in the list with the new one
                        results.pop();
                        //console.log("results full pre", results);
                        addNodeTo(results, tempNodeID, tempNodePort);
                        results = sortListByNumberClosestTo(results, method_OtherNodeID);
                        //console.log("results full post", results);
                    }
                }
                else {
                    addNodeTo(results, tempNodeID, tempNodePort);
                    results = sortListByNumberClosestTo(results, method_OtherNodeID);
                }
            });
            tempListCounter++;
            if (tempListCounter - 1 < tempList.length) {
                recursiveFindNode(method_OtherNodeID, tempList[tempListCounter - 1], callback);
            }
            else {
                console.log("Ran out of unchecked nodes inside loop.");
                callback(results);
            }
        });

    }
    //TODO look at templistcounter
    else {
        tempListCounter++;
        if (tempListCounter - 1 < tempList.length) {
            recursiveFindNode(method_OtherNodeID, tempList[tempListCounter - 1], callback);
        }
        else {
            console.log("Ran out of unchecked nodes outside loop.");
        }
    }
}

//---------------------------------------- STORE FUNCTIONS ----------------------------------------\\
//Jeg ved godt vi diskuterede det, men hvad er pointen helt præcist med at giver otherID med?
function storeValueInFile(otherID, key, type, value, should_replicate, should_hash) {
    console.log("svif");
    if (should_hash == true) {
        var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    }
    if (should_replicate == false) {
        var currentDate = new Date();
        var datetime = currentDate.toLocaleString();
        valueMap[hashedKey] = ({type: type, value: value, timeStamp: datetime});
    }
    if (should_replicate == true) {
        var neighbourNodes;
        nodeLookup(node.nodeID, hashedKey, function (res) {
            neighbourNodes = res;
            //Der skal nok være et lille delay her, for at vente på resultatet :)
            console.log("waiting for neightbournodes to fill", neighbourNodes);
            for (var i = 0; i < neighbourNodes.length; i++) {
                console.log("we in", neighbourNodes[i].port);
                var url = "http://localhost:" + neighbourNodes[i].port + '/api/node/valueMap/replicate';
                console.log('ENTERED SVIF', url);
                axios.post(url, {
                    //Hvad skal ID bruges til?
                    otherID: otherID,
                    key: hashedKey,
                    type: type,
                    value: value
                })
                    .then(function (response) {
                        console.log("svif: ", response.data);
                        //var valuesMap = response.data;
                        //valuesMap[hashedKey].push({type: type, value: value, timeStamp: datetime});

                    })
                    .catch(function (error) {
                        console.log("Something failed \n", error);
                    });
            }
        });
    }
}

function findValue(key, vlNodeList, callback) {
    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    // Tjekker sig selv for information/valuen, i så fald returner
    for (var q = 0; q < Object.keys(valueMap).length; q++) {
        //console.log("0", valueMap);
        //console.log("0.1", hashedKey);
        //console.log("1",Object.values(valueMap)[q] );
        //console.log("2", valueMap[hashedKey]);
        if (Object.values(valueMap)[q] == valueMap[hashedKey]) {
            console.log("vi fandt den.");
            callback(valueMap[hashedKey]);
        }
    }

    console.log("was not found, we continue the quest");
    if (vlNodeList.length > 0) {
        for (var z = 0; z < vlNodeList.length; z++) {
            console.log("inside for loop", vlNodeList[z].port);
            getValues(vlNodeList[z].port, function (res) {
                var tempValMap = {};
                tempValMap = res;
                if (Object.keys(tempValMap).length > 0) {
                    console.log("entered loop");
                    for (var j = 0; j < Object.keys(tempValMap).length; j++) {
                        console.log("tempvalmap", tempValMap);
                        console.log("this", Object.keys(tempValMap)[j]);
                        console.log("that", hashedKey);
                        console.log("__________");
                        if (Object.keys(tempValMap)[j] == hashedKey) {
                            console.log("found in loop");
                            console.log("result", Object.values(tempValMap)[j]);
                            callback(Object.values(tempValMap)[j]);
                        }
                    }
                }
            });
        }
    }
    else {
        console.log("no nodes found");
    }
}

function getValues(port, callback) {
    var url = "http://localhost:" + port + '/api/node/values';
    return axios.get(url)
        .then(function (response) {
            //console.log("values: ", response.data);
            callback(response.data);
        })
        .catch(function (error) {
            console.log("getValues() failed \n", error);
        });

}


