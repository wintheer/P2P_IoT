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
        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
        });
}

function getBuckets() {
    axios.get("../api/node/routingTable")
        .then(function (response) {
            console.log("routingTable: ", response);
            document.getElementById('buckets').innerHTML += response.toString();

        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
        });

}

function ping() {
    var url = 'http://localhost:8887/api/node/ping';
    axios.post(url, {
        nodeID: myNodeID,
        port: myPort
    })
        .then(function (response) {
            console.log("Ping succeeded \n", response);
        })
        .catch(function (error) {
            console.log("Ping failed \n", error);
        });
}

function ping2() {
    var fieldPort = document.getElementById("Port").value;
    console.log(fieldPort);
    var url = "http://localhost:" + fieldPort + '/api/node/ping';
    console.log(url);
    axios.post(url, {
        nodeID: myNodeID,
        port: myPort
    })
        .then(function (response) {
            console.log("Ping succeeded \n", response);
            document.getElementById('receivedInfo').innerHTML += JSON.stringify(response.data) + '  <br>';
        })
        .catch(function (error) {
            console.log("Ping failed \n", error);
        });
}

function addNode(){
    var fieldPort = document.getElementById("Port").value;
    var fieldID = document.getElementById("NodeID").value;
    var url = "http://localhost:" + fieldPort + '/api/node/addnode';
    console.log();
    axios.post(url, {
        my_NodeID: myNodeID,
        my_Port: myPort,
        nodeID: fieldID,
        port: fieldPort
    })
        .then(function (response) {
        console.log("Something succeeded \n", response);
    })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });
    var url2 = "http://localhost:" + myPort + '/api/node/addnode';
     //Notice field_variables and my_variables are swapped from url
    axios.post(url2, {
        my_NodeID: fieldID,
        my_Port: fieldPort,
        nodeID: myNodeID,
        port: myPort
    })
        .then(function (response) {
            console.log("Something succeeded \n", response);
        })
        .catch(function (error) {
            console.log("Something failed \n", error);
        });

}
