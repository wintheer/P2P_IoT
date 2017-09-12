/**
 * Each node has a nodeID, a quasi-unique binary number that identifies it in the network.
 */
var constants = require('./../config/constants');
var async = require('async');
var http = require('http');
var nodeClass = require('./Node');
var port = process.argv.slice(2)[0];
var randomNr = require('./Utilities');
var randomID = require('./Utilities_New');
var serviceRootUrl = 'http://localhost:8282';
var nodeIDList = [];

http.createServer(function (request, response) {
    console.log("Server has been started")
    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("First random nummer: "+randomNr.createQuasi(8));
    var node = createNode();
    console.log(node);
    

    response.write("\nNodeID: "+ node.nodeID.toString());
    response.write("\nNodeIPAddress: "+ node.nodeIPAddress.toString());
    response.write("\nNodePort: "+ node.port.toString());

    if(request.url == '/Test'){
        //response.write("\nRandom ID: "+ randomID.createID());
    }
    response.end();

}).listen(port);
console.log('Server listening on http://localhost:' + port);

function createNode() {

    var generatedNodeId = randomNr.createQuasi(8);
    for(var i = 0; i < nodeIDList.length; i++){
        console.log("welfnwlrgnwlrgnw");
        if(!nodeIDList.isEmpty()){
            nodeIDList.add(generatedNodeId);
            var node = new nodeClass(generatedNodeId, constants.ipAddress,port);
        }
        else if(nodeIDList[i].valueOf() === generatedNodeId){
            createNode();
        }
        else{
            nodeIDList.add(generatedNodeId);
            var node = new nodeClass(generatedNodeId, constants.ipAddress,port);
        }
    }
    return node;
}