var sensorLib = require('node-dht-sensor');

sensorLib.initialize(22, 4);


/*function read() {
    var readout = sensorLib.read();
    console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
}*/

exports.readHumidity = function () {
    var readout = sensorLib.read();
    var humidityValue = readout.humidity.toFixed(2);
    //console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
    return  humidityValue;
};

exports.readTemperature = function () {
    var readout = sensorLib.read();
    var temperatureValue = readout.temperature.toFixed(2);
    console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
    return  temperatureValue;
};

