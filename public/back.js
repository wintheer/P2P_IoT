var myPort;
var myNodeID;
window.onload = function () {
    getInfo();
}

function getInfo() {
    axios.get("../api/node/info")
        .then(function (response) {
            console.log("getInfo() succeeded \n", response);
            //console.log(response);
            myPort = response.data.port;
            myNodeID = response.data.nodeid;
        })
        .catch(function (error) {
            console("getInfo() failed \n", error);
         });
}

function ping() {
    var url = 'http://localhost:8887/api/node/ping';
    axios.post(url, {
        nodeid: myNodeID,
        port: myPort
    })
        .then(function (response) {
            console.log("Ping succeeded \n", response);
        })
        .catch(function (error) {
            console.log("Ping failed \n", error);
        });


}