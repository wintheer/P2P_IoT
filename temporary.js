function primitiveStoreValue(key, type, value) {

    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    //Hvis mappet values ikke indeholder hashedkey -> tilføj værdierne på den hashede key's plads
    if(!values.has(hashedKey)){
        values[hashedKey].push({type: type, value: value, timeStamp: datetime});
    }
    //Ellers hiv den eksisterende liste ud -> overskriv værdierne -> indsæt listen ind i mappet igen
    else{
        //Lidt usikker på følgende, KIG HER!!!
        var currentList = values[hashedKey];
        currentList.append({type: type, value: value, timeStamp: datetime});
        values[hashedKey] = values[hashedKey].append(currentList);
    }
}

function iterativeStoreValue(otherID, key, type, value) {
    //Date
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    //Gem værdierne i sig selv
    primitiveStoreValue(key, type, value);
    //Kald de k nærmeste nodes og få dem til at gemme værdierne
    var neighbourNodes = nodeLookup(node.nodeID, hashedKey);
    for(var i = 0; i < neighbourNodes.length; i++){
        var url = "http://localhost:" + neighbourNodes[i].port + '/api/node/values/replicate';
        console.log('ENTERED SVIF', url);
        axios.post(url, {
            my_NodeID: otherID,
            key: hashedKey,
            type: type,
            value: value
        })
            .then(function (response) {
                console.log("svif: ", response.data);
                //Måske skal der her tjekkes for om det returnede map indeholder den hashede key
                var valuesMap = response.data;
                valuesMap[hashedKey].push({type: type, value: value, timeStamp: datetime});

            })
            .catch(function (error) {
                console.log("Something failed \n", error);
            });
    }
}
function storeValueInFile(otherID, key, type, value, should_replicate) {
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    if(should_replicate == false){
        var currentdate = new Date();
        var datetime = currentdate.toLocaleString();
        values[hashedKey].push({type: type, value: value, timeStamp: datetime});
        //values.push({type: type, value: value, timeStamp: datetime});
    }
    if(should_replicate == true){
        var neighbourNodes = nodeLookup(node.nodeID, hashedKey);
        //var neighbourNodes = findNode(node.nodeID, hashedKey);
        for(var i = 0; i < neighbourNodes.length; i++){
            var url = "http://localhost:" + neighbourNodes[i].port + '/api/node/values/replicate';
            console.log('ENTERED SVIF', url);
            axios.post(url, {
                my_NodeID: otherID,
                key: hashedKey,
                value: value
            })
                .then(function (response) {
                    console.log("svif: ", response.data);
                    var valuesMap = response.data;
                    valuesMap[hashedKey].push({type: type, value: value, timeStamp: datetime});

                })
                .catch(function (error) {
                    console.log("Something failed \n", error);
                });
        }
    }
}
function findValue(key) {
    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");

    // Tjekker sig selv for information/valuen, i så fald returner
    if (values.has(hashedKey)) {
        return values[hashedKey];
    }

    //FindNode på sig selv og key'en for valuen(hash)
    var neighborList = findNode(node.nodeID, hashedKey);
    //Brugbare variabler og lister
    var nodesToCheck = [];
    var checkedNodes = [];
    var counter = 0;
    var found = false;
    //Listen af de nærmeste nodes ud fra hash af key'en, lægges i listen af nodes der skal tjekkes
    nodesToCheck = nodesToCheck.concat(neighborList);

    // Tjekker de andre nodes for information/valuen, i så fald returner
    while (counter < nodesToCheck.length && !found) {
        var otherNode = nodesToCheck[counter];
        //Tjekker om vi allerede har tjekket other node, hvis nej -> tjek, ellers spring over
        if (!checkedNodes.has(otherNode)) {
            //Få fat i den anden node's values map
            var valuesList = "http://localhost:" + otherNode.port + '/api/node/values';
            //Hvis værdien er fundet -> stop
            if (valuesList.has(hashedKey)) {
                found = true;
                return valuesList[hashedKey];
            }
            //Ellers lav findNode mellem den anden node og den hashede key og
            //tilføj denne liste til nodeToCheck
            else {
                nodesToCheck = nodesToCheck.concat(findNode(otherNode, hashedKey));
                checkedNodes.append(otherNode);
                counter++;
            }
        }
    }
}