// Specifications taken from http://xlattice.sourceforge.net/components/protocol/kademlia/specs.html

// small number representing the degree of parallelism in network calls
const alpha = 3;

// Normally this is set to 160bit. is the size in bits of the keys used to identify nodes and store and retrieve data
const B = 8;

// the maximum number of contacts stored in a bucket; this is normally 20
const k = 12;

// the time after which a key/value pair expires
const tExpire = 86400;

// after which an otherwise unaccessed bucket must be refreshed
const tRefresh = 3600;

// the interval between Kademlia replication events, when a node is required to publish its entire database
const tReplicate = 3600;

// the time after which the original publisher must republish a key/value pair
const tRepublish = 86400;

const ipAddress = "http://localhost/";

module.exports = {
    'alpha': alpha,
    'B': B,
    'k': k,
    'tExpire': tExpire,
    'tRefresh': tRefresh,
    'tReplicate': tReplicate,
    'tRepublish': tRepublish,
    'ipAddress': ipAddress
};