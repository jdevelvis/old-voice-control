//Intent intelligence code for command_toggle.js

var util    = require('util'),
    isEmpty = require('underscore').isEmpty,
    find_devices = require('./intent').find_devices,
    action = null,
    parameters = null;

var takeAction = function(data_from_wit, steward, callback) {
    var self = this;

    //Find the devices if possible. If it's not possible, can we tell why?
    found = intent.findDevices(data_from_wit, steward, ["on","off"], ["level"]);

    if (!isNaN(outcome['number'])) { //If the percentage to dim to is available, set it
        //console.log("Inside isEmpty Number " + outcome['number']);
        if (data_from_wit['outcome']['entities']['number'] < 1) {
            action = "off";
        } else {
            action = "on";

            //Throttle the level to 99%. 100% tends to correspond to 50%. Possible bug in Intermatic dimmer switches?
            //Need to test 100% with other dimmer switch manufacturers
	    var level = data_from_wit['outcome']['entities']['number'];
            if (!isNaN(level) && level > 99) { //Max value = 99 for some reason = 100 pushes it back to the default
		level = 99;
	    }
        }

        parameters = JSON.stringify({ 'level': level });
    }

    console.log("command_dim Decision --- Device: " + device + ", Location: " + location + ", Action: " + action + " -- Parameters: " + parameters);

    //Now take action on the data we have - do we need to prompt for more info? Can we do this?
    //Do we need to interact with the speaker?

    

    callback();
}
module.exports.parse = parse;

var getLocation = function() {
    return location;
}
module.exports.getLocation = getLocation;

var getDeviceID = function() {
    return device;
}
module.exports.getDeviceID = getDeviceID;

var getAction = function() {
    return action;
}
module.exports.getAction = getAction;

var complete = function() {
    //Return if there is data in 
    return (!isEmpty(device) && !isEmpty(parameters));
}
module.exports.isComplete = complete;

var getParameters = function () {
    return parameters;
}
module.exports.getParameters = getParameters;
