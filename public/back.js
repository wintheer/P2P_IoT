var myPort;
var myNodeID;
window.onload = function () {
    getInfo();
}

function getInfo() {

    axios.get("../api/node/info")
        .then(function (response) {
            console.log("getInfo() succeeded \n", response);
            myPort = response.data.port;
            myNodeID = response.data.nodeID;
            document.getElementById('myInfo').innerHTML += "My Port: " + myPort;
            document.getElementById('myInfo').innerHTML +=  "<br>";
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

function ping2 () {
    var fieldID =  document.getElementById("ID").value;
    var fieldPort = document.getElementById("Port").value;
    var url = "http://localhost:" + fieldPort;
    axios.post(url, {
        nodeID: fieldID,
        port: fieldPort
    })
        .then(function (response) {
            console.log("Ping succeeded \n", response);
        })
        .catch(function (error) {
            console.log("Ping failed \n", error);
        });


}