
var nodeID;
var nodeIPAddress;
var port;

function Node(nodeID, nodeIPAddress, port) {
    this.nodeID = nodeID;
    this.nodeIPAddress = nodeIPAddress;
    this.port = port;
}

module.exports= {
    node: Node,
    nodeID: nodeID,
    nodeIPAddress: nodeIPAddress,
    port: port
};

