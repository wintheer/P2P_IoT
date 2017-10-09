function primitiveStoreValue(key, tempValue, humidityValue) {
    //Hash the value
    //var hashedKey = crypto.createHash('sha1');
    //hashedKey.update(key);
    //console.log(hashedKey.digest('hex'));
    //values.push({key: hashedKey, tempValue:"Temperature: "+tempValue, humidityValue:"Humidity: "+humidityValue, timestamp: datetime});

    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    //Hvis mappet values ikke indeholder hashedkey -> tilføj en liste til hashedkey med temp, humidity og dato
    if(!values.has(hashedKey)){
        values[hashedKey] = [{Temperature:  tempValue, Humidity: humidityValue, Date: datetime}];
    }
    //Ellers hiv den eksisterende liste ud -> overskriv værdierne -> indsæt listen ind i mappet igen
    else{
        var currentList = values[hashedKey];
        currentList.append({Temperature:  tempValue, Humidity: humidityValue, Date: datetime});
        values[hashedKey] = values[hashedKey].append(currentList);
    }
}
function iterativeStoreValue(key, tempValue, humidityValue) {
    //Hash key
    var hashedKey = crypto.createHash('sha1').update(key).digest("hex");
    //Gem værdierne i sig selv
    primitiveStoreValue(key, tempValue, humidityValue);
    //Kald de k nærmeste nodes og få dem til at køre primitiveStoreValue, så de også gemmer værdierne
    var neightbourNodes = nodeLookup(node.nodeID, hashedKey);
    for(var i = 0; i < neightbourNodes.length; i++){

    }
}