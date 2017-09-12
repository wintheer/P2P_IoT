//This class is meant for making generic methods, that other classes can call. eg. creating a nodeID.
randomID = require('random-id');

/**
 * Creates a random number consisting of the defined amount of bytes
 * @param nr_bytes
 */
exports.createID = function() {
    var id = randomID(3,"aaa000");
    return "" + id;
};
