
var constants = require('./../config/constants');


function k_Buckets() {
    async.series([createBucket, organizeBucket])
}



/**
 * Function for organizing contacts, other nodes known, in buckets which hold a maximum of k contacts (k-buckets).
 */
function createBucket(callback) {

}

function organizeBucket(callback) {

}