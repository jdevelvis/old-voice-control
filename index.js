//Load modules
var steward = require('./steward');
var _ = require('underscore');

//----------------
//Main program
//----------------

//Initialize the steward
steward.init(init_callback, update_callback);

//--------------------
//Function definitions
//--------------------
function init_callback(data) {
	//Do post-init stuff here
	steward.toggle(1,steward.deviceIdFromName("device/4"),null,manage_callback);
}

function update_callback(data) {
	//console.log(steward.deviceIdFromName("Living Room Fan"));
}

function manage_callback(data) {
	console.log(JSON.stringify(data, null, 4));
}
