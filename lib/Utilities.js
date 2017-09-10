//This class is meant for making generic methods, that other classes can call. eg. creating a nodeID.
crypto = require('crypto');

/**
 * Creates a random number consisting of the defined amount of bytes
 * @param nr_bytes
 */
exports.createQuasi = function (nrOfBit) {
    //Because 8 bits pr. byte
    var hexQuasi = crypto.randomBytes(nrOfBit/8, function (ex, buf) {
        var hex = buf.toString('hex');
        var int = parseInt(hex, 16);
    });
    return hexQuasi;
};
