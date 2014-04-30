/***
Intent base code 
***/

var util    = require('util'),
    isEmpty = require('underscore').isEmpty,
    location = null,
    devices = null,
    location_assumed = false,
    devices_assumed = false,

/*
findDevices - using the data supplied, do your best to find any/all devices that fit this command
*/
var findDevices = exports.findDevices = function(data_from_wit, steward, actions, parameters) {
    var self = this;
    var outcome = [];

    for(var attributeName in data_from_wit['outcome']['entities']){
        console.log(attributeName+": "+data_from_wit['outcome']['entities'][attributeName]['value']);
        outcome[attributeName] = data_from_wit['outcome']['entities'][attributeName]['value'];
    }

    //Can we make an assumption to determine unpresent values?
    if (!isEmpty(outcome['location'])) {
        //Great, lets see if we can find the group
        location = steward.getGroupByName(outcome['location']);
    }

    if (isEmpty(location)) { //No location, either we couldn't find one, or one wasn't provided
        //###TODO - Rooms: Upon adding group functionality, track this node's room
        //         and use it here when necessary
/*
	location = "group/1";
        location_assumed = true;
*/
    }

    if (!isEmpty(outcome['device'])) {
        //Great, lets see if we can find the device ID
        devices = steward.getDevicesByName(outcome['device'], location);
    }

    if (isEmpty(devices) || devices == false) {
        //###TODO: Can we infer the actual device name based on the intent, location & action (if present)?
        //          What if it's a group name they're referencing? (IE - 'lights')
        devices = steward.inferDevices(location, actions, parameters);
        console.log("DeviceID By Reference: " + JSON.stringify(devices,null,4));
        devices = "device/14";
        devices_assumed = true;
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
                devices = outcome['device'];
            } else {
                //###TODO: Is there only one of this type of device? If so, use it if we assumed
                //the location. 
                    //If we didn't assume the location prompt because the user gave us a specific location.
                //If there is more than one device of this type/name, prompt for more info

                devices = "device/14";
                device_assumed = true;                    
            }
        } else {
            //Device Not Found - can we use what we have to make an assumption?
            //###TODO: Use data available to make assumptions? (device name, action, location)
            devices = "device/14";
            devices_assumed = true;
        }
    }

    console.log("command_dim Decision --- Device: " + device + ", Location: " + location);
}
