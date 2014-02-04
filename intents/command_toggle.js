//Intent intelligence code for command_toggle.js

var util    = require('util'),
    isEmpty = require('underscore').isEmpty,
    outcome = [];

var parse = function(data, callback, final_callback, dispose) {
    var self = this;

    //Determine what entities should be present
    var entities = ["device","on_off","location"];

    //Prepare expected entities, even blank ones
    for (var i=0, l=entities.length; i < l; i++) {
        var entity = entities[i];
        if (!isEmpty(entity)) { //make sure we don't accidentally add a blank member
            if (!isEmpty(data['outcome']['entities'][entity])) {
                console.log("Entity: " + entity);
                console.log(JSON.stringify(data['outcome']['entities'][entity],null,4));
                outcome[entity] = data['outcome']['entities'][entity]["value"];
            }
        }
    }

    //Can we make an assumption to determine unpresent values?
    if (isEmpty(outcome['location'])) {
        //###TODO - Rooms: Upon adding group functionality, track this node's room $
        //         and use it here when necessary

        //###TODO: Can we infer the location based on the subject name?
        outcome['location'] = "living room";
    }

//    if (isEmpty(outcome['device'])) {
        //###TODO: Can we infer the actual device name based on the intent, location & action (if present)?
        outcome['device'] = "device/4";
//    } //###TODO: Verify the subject is actually a valid device! "Turn on the light" probably won't 
        //work without some thought behind what "light" actually means
        //"Lights" is a better subject to make assumptions on - "light" could mean any one
        //specific light in a room - check how many on_off devices there are, if any have "light"
        //in their name, etc, to see if you can make a good guess. If not, prompt for the answer

    if (isEmpty(outcome['on_off'])) {
        //Can we infer the action based on intent, subject and/or location?
        //IE - "flip the light" etc

        //When in doubt, toggle the light's status
        if (steward.get_status(outcome['device']) == "off") {
            outcome['on_off'] = "on";
        } else {
            outcome['on_off'] = "off";
        }
    }

    //Decide if we have all the necessary information to perform this action or not
    outcome["complete"] = (!isEmpty(outcome['device']) && !isEmpty['on_off']);

    callback(this, final_callback, dispose);
}
module.exports.parse = parse;

var location = function() {
    return outcome['location'];
}
module.exports.getLocation = location;

var device = function() {
    return outcome['device'];
}
module.exports.getDevice = device;

var action = function() {
    return outcome['on_off'];
}
module.exports.getAction = action;

var complete = function() {
    console.log(outcome);
    return outcome['complete'];
}
module.exports.isComplete = complete;

var parameters = function () {
    //parameters are always null for on/off commands, but other devices have them
    return null;
}
module.exports.getParameters = parameters;
