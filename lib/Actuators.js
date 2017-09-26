var onoff = require('onoff');
var Gpio = onoff.Gpio, led = new Gpio(17, 'out');
var isLedOn = false;

exports.turnOnOffLed = function () {
    value = (led.readSync() + 1) % 2;
    if(isLedOn){
        value = 0;
        isLedOn = false;
    }
    else{
        value = 1;
        isLedOn = true;
    }
    led.write(value, function() {
        console.log("Changed LED state to: " + value);
    });
};