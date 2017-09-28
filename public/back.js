var myPort;
var myNodeID;
window.onload = function () {
    getInfo();
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
