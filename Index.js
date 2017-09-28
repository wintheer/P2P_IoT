var randomNr = require('./Utilities');
var express = require('express'), bodyParser = require('body-parser');
var constants = require('./config/constants');
var routing = require('./Routingtable');
var routingTable = new routing();
var app = express();
app.use(bodyParser.json());
var path = require("path");
var nodeClass = require('./lib/Node');
var port = process.argv.slice(2)[0];
var node;
var nodeID;
var nodeIDList = [];


function initialNode() {
    //Add specific other node
    //Add node argument

}
// We need this to be able to call cross-origin, 
// which means that to different peers calling eachother 
// on different ports
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));
// For all of out routes we add next after res
// which then uses inheritance to allow all routes
// to get information from cross-origin calls
app.get('/', function (req, res, next) {
     res.sendFile(path.join(__dirname + '/public/index.html'));
})

//Post Request expecting nodeID and port in body
app.post('/api/node/ping', function(req, res, next) {
    var remote_nodeid = req.body['nodeID'];
    var remote_port = req.body['port'];
    console.log('From noteid', remote_nodeid, 'port', remote_port );
    // Update Buckets
    res.send({'event': 'PONG', 'nodeID': node.nodeID, 'port': port});

});

// Able to return information about this peer
app.get('/api/node/info', function (req, res, next) {
   res.json({'nodeID': node.nodeID, 'port': port});
});



var server = app.listen(port, function () {
   //var host = server.address().address;
   var port = server.address().port;
    node = createNode();
    console.log('Server listening on http://localhost:' + port);
});

function createNode() {
    var nodeItem;
    var generatedNodeID = randomNr.createQuasi(8);
    if (nodeIDList.indexOf(generatedNodeID) === -1) {
        nodeIDList.push(generatedNodeID);

        nodeItem = new nodeClass.node(generatedNodeID, constants.ipAddress, port)
    }
    else {
        createNode()
    }
    return nodeItem;
}

module.exports ={
    getNodeID: function() {
        return nodeID;
    },

    getPort: function() {
        return port;
    }
};