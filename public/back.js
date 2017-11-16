var myPort;
var myNodeID;
var ipAddress;
window.onload = function () {
    getLocalIP(function (res) {
        var temp_ipAddress = res+":";
        //  ipAddress = ipAddress.toString();
        ipAddress = "http://" + temp_ipAddress;
        console.log(ipAddress);
    });
    getInfo();
    getValues();
    setTimeout(function(){
        getBuckets();
    },100);

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
            document.getElementById('Port').value = myPort;
            document.getElementById('NodeID').value = myNodeID;
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
            var buckets = response.data;
            console.log(buckets.length);
            for(var j = 0; j < buckets.length; j++){
                // Create table.
                var tableDiv = document.createElement('tableDiv');
                var table = document.createElement('table');
                table.setAttribute("id", j.toString());
                // Insert New Row for table at index '0'.
                //Header Stuff________________________
                var header = table.createTHead();
                var row = header.insertRow(-1);
                var cell = row.insertCell(0);
                cell.innerHTML = "<b>ID</b>";
                var cellt = row.insertCell(1);
                cellt.innerHTML = "<b>PORT</b>";
                header.insertRow(0).insertCell(-1).innerHTML += "Bucket " + j;
                //____________________________________
                for(var z = 0; z <= buckets[j].length; z++){
                    var editNode = buckets[j][z];
                    if(editNode != undefined){
                        var row1 = table.insertRow(-1);
                        // Insert New Column for Row1 at index '0'.
                        var row1col1 = row1.insertCell(0);
                        row1col1.innerHTML = editNode.nodeID;
                        // Insert New Column for Row1 at index '1'.
                        var row1col2 = row1.insertCell(1);
                        var linkText = editNode.port;
                        var link = ipAddress + editNode.port;
                        console.log("link",link);
                        row1col2.innerHTML = "<a href="+link+">"+ linkText +"</a>";
                    }
                }
                tableDiv.appendChild(table);
                var div = document.getElementById('buckets');
                div.appendChild(tableDiv);
            }

        })
        .catch(function (error) {
            console.log("getInfo() failed \n", error);
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
    var url = ipAddress + fieldPort + '/api/node/ping';
    console.log("ping url", url);
    url = url.toString();
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
    var url2 = ipAddress + myPort + '/api/node/ping';
    url2 = url2.toString();
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
    var url = ipAddress + fieldPort + '/api/node/findNode';
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
    var url = ipAddress + fieldPort + '/api/node/nodeLookup';
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
    //console.log(fieldPort, fieldID, fieldKey);
    var url = ipAddress + fieldPort + '/api/node/values/findValue';
    axios.post(url, {
        key: fieldKey
    })
        .then(function (response) {
                console.log("findValue", response.data);
                values = response.data;
                console.log(values);

        })
        .catch(function (error) {
            console.log("findvalue error", error);
        })
}

function storeValue() {
    var fieldPort = document.getElementById("Port").value;
    var fieldID = document.getElementById("NodeID").value;
    var fieldKey = document.getElementById("Key").value;
    var fieldType = document.getElementById("Type").value;
    var fieldValue = document.getElementById("Value").value;
    //console.log("port", fieldPort, "id", fieldID, "key", fieldKey, "type", fieldType, "value", fieldValue);
    var url = ipAddress + fieldPort + '/api/node/valueMap/localStoreValue';
    axios.post(url, {
        id: fieldID,
        key: fieldKey,
        type: fieldType,
        value: fieldValue
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log("storevalue error", error);
        })
}

function getLocalIP(callback) {
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
        var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        callback(myIP);
        pc.onicecandidate = noop;
    };
}