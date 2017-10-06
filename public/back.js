var myPort;
var myNodeID;
window.onload = function () {
    getInfo();
    getBuckets();
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
            console.log("routingTable: ", response);
            document.getElementById('buckets').innerHTML += response.data;

        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
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
    console.log(url);
    axios.post(url, {
        my_NodeID: myNodeID
    })
        .then(function (response) {
            console.log("findNode \n", response);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });
}

function nodeLookup() {
    var fieldPort = document.getElementById("Port").value;
    var url = "http://localhost:" + fieldPort + '/api/node/nodeLookup';
    axios.post(url, {
        target_NodeID: myNodeID,
    })
        .then(function (response) {
            console.log("nodeLookup \n", response);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });
    
}