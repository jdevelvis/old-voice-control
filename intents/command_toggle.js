//Intent intelligence code for command_toggle.js

var util    = require('util'),
    isEmpty = require('underscore').isEmpty,
    findDevices = require('./intent.js').findDevices;

var takeAction = function(data_from_wit, roomie_id, steward, callback) {
    var self = this;
	var on_off = null;
	var commands = [];
	console.log("Taking Action on: " + JSON.stringify(data_from_wit,null,4));

	if (!isEmpty(data_from_wit['outcome']['entities']['on_off'])) {
		on_off = data_from_wit['outcome']['entities']['on_off']['value'];
	}

	if (isEmpty(on_off)) {
		//###TODO - Prompt for on or off here? Or before we take action, below?
	}

    //Find the devices if possible. If it's not possible, can we tell why?
    devices = findDevices(data_from_wit, roomie_id, steward, ["on","off"]);

	for (var i in devices) {
		commands.push({device_id:devices[i].id,action:on_off});
	}

    console.log("command_toggle Decision --- Issuing Commands: " + JSON.stringify(commands,null,4));

    //Now take action on the data we have - do we need to prompt for more info? Can we do this?
    //Do we need to interact with the speaker?

	var request_id = 1983;
	for (var i in commands) {
		steward.perform(request_id,commands[i]['device_id'],commands[i]['action'],null);
		request_id++;
	}

    callback();
}
module.exports.takeAction = takeAction;
