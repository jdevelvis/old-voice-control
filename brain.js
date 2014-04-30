var wit     = require('./wit'),
    steward = require('./steward')
;

var init = function(callback) {
    //Initialize the steward
    steward.init(init_callback, update_callback);
}
module.exports.init = init;

var init_callback = function(data) {
//###This line is just for testing... Will be replaced with command_received
//    speech_received("dim the lights to 100 percent");
}

var update_callback = function(element) {
	console.log (">> Update received for: " + JSON.stringify(element,null,4));

	//Check if there's a magic event associated with this update
        //###Todo - Needs to be modified to be dynamic (maybe similar to intent structure)
	//Hard coding for now
        switch (element.whatami) {
                case '/device/sensor/ehma/roomie':
			console.log(element.info.command);
			speech_received(element.info.command);
                break;
        }
}

var manage_callback = function(data) {
    console.log(JSON.stringify(data, null, 4));
}

var speech_received = function(command) {
    think(command, manage_callback);
}

var think = function(command, callback) {
    var self = this;
    data = data.toString().toLowerCase();
    console.log(command);

    wit.think(command,function(err, response) { 
        if (!err) {
	    //Make sure there is an outcome
	    if (response['outcome']) {
        	var outcome = [];
	        //Find the intent & parse it
        	var intent = require('./intents/' + response['outcome']['intent']);
	        intent.take_action(response, steward, function(status) {
		    console.log("Status: " + status);
		    if (callback) callback(status);
		});
	    }

        } else {} //### Error Handling Needed Here
    });
}

var decide = function(data_from_wit, callback) {
    console.log("------- Deciding On An Action -------");
/*
    console.log(command.outcome);
    console.log(command['outcome']);
*/
    console.log("Outcome: " + JSON.stringify(data_from_wit,null,4));

}
