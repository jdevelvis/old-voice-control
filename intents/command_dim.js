//Intent intelligence code for command_toggle.js

var util = require('util'),
    isEmpty = require('underscore').isEmpty,
    findDevices = require('./intent.js').findDevices;

var takeAction = function(data_from_wit, roomie_id, steward, callback) {
    var self = this;
	var action = null;
	var level = null;
	var parameter = null;
	var commands = [];
	console.log("Taking Action");

    //Find the devices if possible. If it's not possible, can we tell why?
    var devices = findDevices(data_from_wit, roomie_id, steward, ["on","off"], ["level"]);

	if (!isEmpty(data_from_wit['outcome']['entities']['number'])) {
	    if (!isNaN(data_from_wit['outcome']['entities']['number']['value'])) { //If the percentage to dim to is available, set it
			level = data_from_wit['outcome']['entities']['number']['value'];
        	if (level < 1) {
            	action = "off";
	        } else {
    	        action = "on";

        	    //Throttle the level to 99%. 100% tends to correspond to 50%. Possible bug in Intermatic dimmer switches?
            	//Need to test 100% with other dimmer switch manufacturers
	            if (level > 99) { //Max value = 99 for some reason = 100 pushes it back to the default
					level = 99;
				}
        	}
		}
        parameter = JSON.stringify({level: level});

		for (var i in devices) {
			commands.push({device_id:devices[i].id,action:action,parameter:parameter});
		}
	} else {
		action = "on";
		//Level isn't present, cut the current value in half to accomplish dimming
		for (var i in devices) {
			level = steward.getParameter(devices[i].id,'level');
			level /= 2;
//			console.log("device_id: " + devices[i].id + " -- Level/2: " + level);
			if (level > 0) {
				parameter = {level:level};
//				console.log("Adding command: " + JSON.stringify(parameter,null,4));
	            commands.push({device_id:devices[i].id,action:action,parameter:parameter});
			} //No else, because if the level is 0, we don't need to worry about dimming it further
        }		
	}    

    console.log("command_dim Decision --- Issuing Commands : " + JSON.stringify(commands,null,4));

    //Now take action on the data we have - do we need to prompt for more info? Can we do this?
    //Do we need to interact with the speaker?

    for (var i in commands) {
		steward.perform('1982',commands[i]['device_id'],commands[i]['action'],commands[i]['parameter']);
	}

    callback();
}
module.exports.takeAction = takeAction;
