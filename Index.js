var randomNr = require('./Utilities');
var express = require('express'), bodyParser = require('body-parser');
var constants = require('./config/constants');
var app = express();
app.use(bodyParser.json());
var path = require("path");
var nodeClass = require('./lib/Node');
var port = process.argv.slice(2)[0];
var node;
var nodeid;
var nodeIDList = [];


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

//Post Request expecting nodeid and port in body
app.post('/api/node/ping', function(req, res, next) {
    var remote_nodeid = req.body['nodeid'];
    var remote_port = req.body['port'];

    console.log('From noteid', remote_nodeid, 'port', remote_port );
    
    // Update Buckets
    
    res.send({'event': 'PONG', 'nodeid': nodeid, 'port': port}); 
})

// Able to return information about this peer
app.get('/api/node/info', function (req, res, next) {
   res.json({'nodeid': nodeid, 'port': port});
})

var server = app.listen(port, function () {
   //var host = server.address().address;
   var port = server.address().port;
    node = createNode();

    console.log('Server listening on http://localhost:' + port);
})

function createNode() {
    var nodeItem;
    var generatedNodeId = randomNr.createQuasi(8);
    if (nodeIDList.indexOf(generatedNodeId) === -1) {
        nodeIDList.push(generatedNodeId);
        nodeItem = new nodeClass.node(generatedNodeId, constants.ipAddress, port)
    }
    else {
        createNode()
    }
    return nodeItem;
}

module.exports ={
    getNodeID: function() {
        return nodeid;
    },

    getPort: function() {
        return port;
    }
}