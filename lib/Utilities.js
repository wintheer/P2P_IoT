//This class is meant for making generic methods, that other classes can call. eg. creating a nodeID.
crypto = require('crypto');
var index = require('./Index');
/**
 * Creates a random number consisting of the defined amount of bytes
 * @param nr_bytes
 */
exports.createQuasi = function (nrOfBit) {
    //Because 8 bits pr. byte
    var nrofByte = nrOfBit/8;
    var id = crypto.randomBytes(nrofByte).toString('hex');

    console.log(`${id.length} bytes of random data: ${id.toString('hex')}`);

    var idInInteger = parseInt(id.toString('hex'), 16);

    console.log(id + '(hex) converted to int: ' + idInInteger);

    //id = crypto.createHash('sha1').update(id, 'utf8');
    return "" + idInInteger;
};

/**
 * This function calculates which index of the new node
 * with the calculated distance should be placed on
 * @param distance
 * @returns {number}
 */
function findMostSignificantBit(distance) {
    // Converts the decimal NodeID to binary
    var nodeIDInBit = (distance >>> 0).toString(2);
    var bitInString = nodeIDInBit.toString();

    //The index the nodeID is to be placed on.
    var bitPosition = 0;
    var counter = 0;

    while (counter < bitInString.length) {
        if (bitInString.charAt(counter) !== "0") {
            bitPosition++;
        }
        counter++;
    }
    
    return bitPosition;
}