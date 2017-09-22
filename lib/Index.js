/**
 * Each node has a nodeID, a quasi-unique binary number that identifies it in the network.
 */
var onoff = require('onoff');
var constants = require('./../config/constants');
var express = require('express');
var nodeClass = require('./Node');
var randomNr = require('./Utilities');
var path = require('path');
var sensors = require('./sensors');
var actuators = require('./actuators');
var app = express();
var nodeIDList = [];
var node;
var nodeID;
var port = process.argv.slice(2)[0];

var router = express.Router();



    /**
     response.write("\nNodeID: "+ node.nodeID.toString());
     response.write("\nNodeIPAddress: "+ node.nodeIPAddress.toString());
     response.write("\nNodePort: "+ node.port.toString());
     */

    app.use(express.static(path.join(__dirname, 'public')));


app.use('/', router);

    var tempPort = process.env.PORT || port
    app.listen(tempPort, function () {
        console.log("Server has been started");
        //response.writeHeader(200, {"Content-Type": "text/plain"});
        node = createNode();
        window.nodeID = node.nodeID;
        //response.end();
    });

    router.get('/', function (req, res) {

        res.sendFile(__dirname + '/Button_Page.html');
    });


    router.get('/api/node/ping', function (req, res) {
        //res.send("Hello World")
        console.log("Hej, nogen var på besøg")
    });
    /*router.post('/api/node/ping', function (req, res) {
        var nodeID = req.body['nodeID'];
        var nodePort = req.body['port'];
        res.send({'event': 'PONG', 'nodeID': nodeID, 'port': nodePort});

    });*/

    router.get('/api/actuators/led', function (req, res) {
        actuators.turnOnOffLed();
    });


    router.get('/api/node/info', function (req, res) {
       res.json({'nodeID': nodeID, 'port': port});
    });

router.get('/api/sensors/humidity', function (req, res) {
    var humiditySensor = sensors.readHumidity();
    res.json({'Humidity': humiditySensor+ " %"});
});
router.get('/api/sensors/temperature', function (req, res) {
    var temperatureSensor = sensors.readTemperature();
    res.json({'Temperature ': temperatureSensor+" C"});
});


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