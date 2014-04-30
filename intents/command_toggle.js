//Intent intelligence code for command_toggle.js

var util    = require('util'),
    isEmpty = require('underscore').isEmpty,
    location = null,
    device = null,
    action = null,
    parameters = null,
    location_assumed = false,
    device_assumed = false,
    action_assumed = false;

var parse = function(data, steward, callback, final_callback, dispose) {
    var self = this;
    var outcome = [];

    for(var attributeName in data['outcome']['entities']){
        console.log(attributeName+": "+data['outcome']['entities'][attributeName]['value']);
        outcome[attributeName] = data['outcome']['entities'][attributeName]['value'];
    }

    console.log(outcome.toString());

    //Can we make an assumption to determine unpresent values?
    if (!isEmpty(outcome['location'])) {
        //Great, lets see if we can find the group
        location = steward.getGroupByName(outcome['location']);
    }

    if (isEmpty(location)) { //No location, either we couldn't find one, or one wasn't provided
        //###TODO - Rooms: Upon adding group functionality, track this node's room
        //         and use it here when necessary
        location = "group/1";
        location_assumed = true;
    }

    if (!isEmpty(outcome['device'])) {
        //Great, lets see if we can find the device ID
        device = steward.getDeviceIDByName(outcome['device']);
    }

    if (isEmpty(device)) {
        //###TODO: Can we infer the actual device name based on the intent, location & action (if present)?
        //          What if it's a group name they're referencing? (IE - 'lights')
        device = "device/7";
        device_assumed = true;
    } else {
        //###TODO: Verify the subject is actually a valid device! "Turn on the light" probably won't 
        //work without some thought behind what "light" actually means
        //"Lights" is a better subject to make assumptions on - "light" could mean any one
        //specific light in a room - check how many on_off devices there are, if any have "light"
        //in their name, etc, to see if you can make a good guess. If not, prompt for the answer
        
        console.log("Device Exists? " + steward.deviceExists(outcome['device']));

        //Does the device exist?
        if (steward.deviceExists(outcome['device'])) {
            //Does it exist in the given location?
            if (steward.deviceExistsInGroup(outcome['device'],location)) {
                //Win! Use it.
                device = outcome['device'];
            } else {
                //###TODO: Is there only one of this type of device? If so, use it if we assumed
                //the location. 
                    //If we didn't assume the location prompt because the user gave us a specific location.
                //If there is more than one device of this type/name, prompt for more info

                device = "device/7";
                device_assumed = true;                    
            }
        } else {
            //Device Not Found - can we use what we have to make an assumption?
            //###TODO: Use data available to make assumptions? (device name, action, location)
            device = "device/7";
            device_assumed = true;
        }
    }

    if (isEmpty(outcome['on_off'])) {
        //###TODO: Can we infer the action based on intent, subject and/or location?
        //IE - "flip the light" etc

        //When in doubt, toggle the device's status
        if (steward.get_status(device) == "off") {
            action = "on";
        } else {
            action = "off";
        }
        action_assumed = true;
    } else {
        //Does the action exist for this device?
        if(steward.actionExists(device,outcome["on_off"])) {
            //Great! Use it.
            action = outcome["on_off"];
        } else {
            //The action doesn't exist, just toggle the device
            if (steward.get_status(device) == "off") {
                action = "on";
            } else {
                action = "off";
            }
            action_assumed = true;            
        }
    }

    console.log("command_toggle Decision --- Device: " + device + ", Location: " + location + ", Action: " + action);

    callback(this, final_callback, dispose);
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
    return (!isEmpty(device) && !isEmpty(action));
}
module.exports.isComplete = complete;

var getParameters = function () {
    //parameters are always null for on/off commands, but other devices may have them
    return parameters;
}
module.exports.getParameters = getParameters;
