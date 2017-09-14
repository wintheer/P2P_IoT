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
var node;

http.createServer(function (request, response) {
    console.log("Server has been started")
    response.writeHeader(200, {"Content-Type": "text/plain"});
    console.log(node);
    
/**
    response.write("\nNodeID: "+ node.nodeID.toString());
    response.write("\nNodeIPAddress: "+ node.nodeIPAddress.toString());
    response.write("\nNodePort: "+ node.port.toString());
 */

    switch(request.url){
        case '/NodeList':
            if(nodeIDList.length > 0){
                for(var i = 0; i < nodeIDList.length; i++){
                    //response.write("\n"+i+": " + nodeIDList[i].toString());
                    response.write("\nNodeID: "+ node.nodeID.toString() +" , "+"NodeIPAddress: "+
                        node.nodeIPAddress.toString() + " , " +
                        "NodePort: "+ node.port.toString());
                }
            }
            else{
                response.write("\nNo Nodes in the list");
            }
            break;
        case '/CreateNode':
             node = createNode();
            response.write("Created node!");
            break;
        default:
    }
    response.end();

}).listen(port);
console.log('Server listening on http://localhost:' + port);

function createNode() {

    var generatedNodeId = randomNr.createQuasi(8);
    if(nodeIDList.indexOf(generatedNodeId) === -1){
        nodeIDList.push(generatedNodeId);
        var nodeItem = new nodeClass(generatedNodeId, constants.ipAddress, port)
    }
    else{
        createNode()
    }
    return nodeItem;
}