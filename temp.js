//---------------------------------------- NODE FUNCTIONS ----------------------------------------\\
var values = [];



function storeValue(type, value) {
    var currentdate = new Date();
    var datetime = currentdate.toLocaleString();
    values.push({type: type, value:value, timeStamp:datetime});
}




