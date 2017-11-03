var myPort;
var myNodeID;

window.onload = function () {
    getInfo();
    getBuckets();
    getValues();
};

function getInfo() {
    axios.get("../api/node/info")
        .then(function (response) {
            console.log("getInfo() succeeded \n", response);
            myPort = response.data.port;
            myNodeID = response.data.nodeID;
            document.getElementById('myInfo').innerHTML += "My Port: " + myPort;
            document.getElementById('myInfo').innerHTML += "<br>";
            document.getElementById('myInfo').innerHTML += " My NodeID: " + myNodeID;
            document.title = myPort;
        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
        });
}

/**
 * Fix to pretty HTML
 * */
function getBuckets() {
    axios.get("../api/node/routingTable")
        .then(function (response) {
            console.log("routingTable: ", response.data);
            document.getElementById('buckets').innerHTML += JSON.stringify(response.data);

        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
        });

}

function getValues() {
    axios.get("../api/node/values")
        .then(function (response) {
            console.log("values: ", response.data);
            document.getElementById('values').innerHTML += JSON.stringify(response.data);

        })
        .catch(function (error) {
            console("getValues() failed \n", error);
        });
}

function ping() {
    var fieldPort = document.getElementById("Port").value;
    var fieldID = document.getElementById("NodeID").value;
    var url = "http://localhost:" + fieldPort + '/api/node/ping';
    console.log();
    axios.post(url, {
        my_NodeID: myNodeID,
        my_Port: myPort,
        nodeID: fieldID
    })
        .then(function (response) {
            console.log("Remote Ping Succeeded \n", response);
            document.getElementById('receivedInfo').innerHTML += JSON.stringify(response.data) + '<br>';
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });
    var url2 = "http://localhost:" + myPort + '/api/node/ping';
    //Notice field_variables and my_variables are swapped from url
    axios.post(url2, {
        my_NodeID: fieldID,
        my_Port: fieldPort,
        nodeID: myNodeID,
        port: myPort
    })
        .then(function (response) {
            console.log("Local Ping Succeeded \n", response);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });

}

function findNodeWebHelper() {
    var fieldPort = document.getElementById("Port").value;
    var url = "http://localhost:" + fieldPort + '/api/node/findNode';
    axios.post(url, {
        my_NodeID: myNodeID
    })
        .then(function (response) {
            console.log("findNode \n", response.data);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });
}

function nodeLookup() {
    var fieldPort = document.getElementById("Port").value;
    var fieldID = document.getElementById("NodeID").value;
    var url = "http://localhost:" + fieldPort + '/api/node/nodeLookup';
    axios.post(url, {
        target_NodeID: fieldID,
    })
        .then(function (response) {
            console.log("nodeLookup \n", response);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });

}

function findValueWeb() {
    var fieldPort = document.getElementById("Port").value;
    var fieldID = document.getElementById("NodeID").value;
    var fieldKey = document.getElementById("Key").value;
    console.log(fieldPort, fieldID, fieldKey);
    var url = "http://localhost:" + fieldPort + '/api/node/values/findValue';
    axios.post(url, {
        key: fieldKey
    })
        .then(function (response) {
                console.log("findValue", response.data);
                values = response.data;
                console.log(values);
                //findValue(fieldKey);

        })
        .catch(function (error) {
            console.log("findvalue error", error);
        })
}

function findValue(key) {
    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");

    // Tjekker sig selv for information/valuen, i så fald returner
    if (values.has(hashedKey)) {

        return values[hashedKey];
    }

    //Findnode på sig selv og key'en for valuen(hash)
    var neighborList = nodeLookup(node.nodeID, hashedKey);
    //Brugbare variabler og lister
    var nodesToCheck = [];
    var checkedNodes = [];
    var counter = 0;
    var found = false;
    //Listen af de nærmeste nodes ud fra hash af key'en, lægges i listen af nodes der skal tjekkes
    nodesToCheck = nodesToCheck.concat(neighborList);

    // Tjekker de andre nodes for information/valuen, i så fald returner
    while (counter < nodesToCheck.length && !found) {
        var otherNode = nodesToCheck[counter];
        //Tjekker om vi allerede har tjekket other node, hvis nej -> tjek, ellers spring over
        if (!checkedNodes.has(otherNode)) {
            //Få fat i den anden node's values map
            var valuesList = "http://localhost:" + otherNode.port + '/api/node/values';
            //Hvis værdien er fundet -> stop
            if (valuesList.has(hashedKey)) {
                found = true;
                return valuesList[hashedKey];
            }
            //Ellers lav findNode mellem den anden node og den hashede key og
            //tilføj denne liste til nodeToCheck
            else {
                nodesToCheck = nodesToCheck.concat(findNode(otherNode, hashedKey));
                checkedNodes.append(otherNode);
                counter++;
            }
        }
    }
}
