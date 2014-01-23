//Load modules
var steward = require('./steward');
var sphinx = require('./sphinx');
var _ = require('underscore');
var wit = require('./wit');

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
	//steward.toggle(1,steward.deviceIdFromName("device/4"),null,manage_callback);
    sphinx.launch(null,recognize_speech_callback,null);
}

function update_callback(data) {
	//console.log(steward.deviceIdFromName("Living Room Fan"));
}

function manage_callback(data) {
	console.log(JSON.stringify(data, null, 4));
}

function recognize_speech_callback(data) {
    data = data.toString().toLowerCase();
    console.log(data);

    var wit_request = wit.think(data,'7DKBTBCSC7UDTG5T73XOOOU4YOSZC4WI');

    wit_request.when(function(err, response) {
        if (err) console.log(err); //### handle error here
        console.log("------- Taking Action -------");
        take_action(response);
    });
}

function take_action(command) {
    console.log(JSON.stringify(command,null,4));
    if (command['outcome']) {
        if (command['outcome']['intent'] == "toggle" && command['outcome']['on_off'] == "on") {
            console.log("Turning the lights on");
            steward.manage(101,steward.deviceIdFromName("device/4"),"on",null,manage_callback);
        } else if (data == "ehma turn the dining room light off") {
            console.log("Turning the lights off");
            steward.manage(102,steward.deviceIdFromName("device/4"),"off",null,manage_callback);
        }
    }
}
