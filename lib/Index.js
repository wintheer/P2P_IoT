/**
 * Each node has a nodeID, a quasi-unique binary number that identifies it in the network.
 */
var constants = require('./../config/constants');
var bodyParser = require('body-parser');
var http = require('http');
var express = require('express');
var nodeClass = require('./Node');
var randomNr = require('./Utilities');
var path = require('path');
var app = express();
var nodeIDList = [];
var node;
var port = process.argv.slice(2)[0];

var router = express.Router();


http.createServer(function (request, response) {
    console.log("Server has been started")
    response.writeHeader(200, {"Content-Type": "text/plain"});


    /**
     response.write("\nNodeID: "+ node.nodeID.toString());
     response.write("\nNodeIPAddress: "+ node.nodeIPAddress.toString());
     response.write("\nNodePort: "+ node.port.toString());
     */

    /*    switch(request.url){
            case '/NodeList':
                if(nodeIDList.length > 0){
                    for(var i = 0; i < nodeIDList.length; i++){
                        response.write("\n"+i+": " + nodeIDList[i].toString());
                        //response.write("\nNodeID: "+ node.nodeID.toString() +" , "+"NodeIPAddress: "+
                          //  node.nodeIPAddress.toString() + " , " +
                           // "NodePort: "+ node.port.toString());
                    }
                }
                else{
                    response.write("\nNo Nodes in the list");
                }
                break;
            case '/CreateNode':
                 node = createNode();
                response.write("Node created!");
                break;
            default:
        }
        response.end();

    }).listen(port);
    console.log('Server listening on http://localhost:' + port);*/
});
    //-------------- Express Here ---------------------
    //app.use(bodyParser.urlencoded({ extended: true }));
    //app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));


app.use('/', router);

    var tempPort = process.env.PORT || port
    app.listen(tempPort);

    router.get('/', function (req, res) {

        res.sendFile(__dirname + '/Button_Page.html');
    });


    router.get('/api/node/ping', function (req, res) {

    });


    router.get('/NodeList/', function (req, res) {
        if(nodeIDList.length > 0){
            for(var i = 0; i < nodeIDList.length; i++){
                res.json(nodeIDList);

                //res.write("\n"+i+": " + nodeIDList[i].toString());
                //response.write("\nNodeID: "+ node.nodeID.toString() +" , "+"NodeIPAddress: "+
                //  node.nodeIPAddress.toString() + " , " +
                // "NodePort: "+ node.port.toString());
            }
        }
    else{
            res.json(nodeIDList);
        }
    })


    console.log('Server listening on http://localhost:' + port);

    function createNode() {

        var generatedNodeId = randomNr.createQuasi(8);
        if (nodeIDList.indexOf(generatedNodeId) === -1) {
            nodeIDList.push(generatedNodeId);
            var nodeItem = new nodeClass(generatedNodeId, constants.ipAddress, port)
        }
        else {
            createNode()
        }
        return nodeItem;
    }