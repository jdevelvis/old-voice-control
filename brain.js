var wit     = require('./wit'),
    steward = require('./steward'),
    fs  = require('fs'),
	isEmpty = require('underscore').isEmpty,
	minConfidence = .70,
	maxConfidence = .90
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
					if (!isEmpty(element.info.command.trim())) {
						console.log("Speech Received: " + element.info.command.trim());
						think(element.info.command.trim(), element.whoami, manage_callback);
					}
                break;
        }
}

var manage_callback = function(data) {
    console.log(JSON.stringify(data, null, 4));
}

var think = function(command, roomie_id, callback) {
    var self = this;

    command = command.toString().toLowerCase();
    console.log("Thinking... Command: " + command);

    wit.think(command, function(err, response) { 
		console.log("Thought recieved: " + JSON.stringify(response,null,4));
        if (!err) {
		    //Make sure there is an outcome
		    if (response['outcomes'][0]) {
				//Does this intent exist?
				var intent = null;
				var intent_file_name = '/intents/' + response['outcomes'][0]['intent'];
				var intent_path =__dirname + intent_file_name + '.js';

				console.log("Outcome: " + JSON.stringify(response['outcomes'][0],null,4));
				console.log("Does the intent exist? " + intent_path + fs.existsSync(intent_path));

				//###MUST REMOVE response...command_toggle' && from this! Added it to only perform toggle commands
				if (response['outcomes'][0]['intent']=='command_toggle' && fs.existsSync(intent_path)) {
			        //Find the intent & parse it
   			   		intent = require('.' + intent_file_name);
				} else {
					//###TODO: Verbal response noting that EHMA understands the intent, 
					//but needs updated before she can take action on it
					console.log('Warning: Intent recognized, but intent logic module not found');
				}

				//Check confidence thresholds 
				//### Does this need updated for multiple outcomes?
				var confidence = response['outcomes'][0]['confidence'];
				if (confidence < minConfidence) {
					console.log('Not confident in this command, tell Roomie to play deny sound.');
					steward.perform('7001',roomie_id,'play_sound','deny');

				} else if (confidence > minConfidence && confidence < maxConfidence)  {
					console.log('Fairly confident, but verifying to be sure. Tell Roomie to confirm.');
					steward.perform('8001',roomie_id,'speak','Did you mean');

				} else { // We're confident. Let's do this
	
			       	intent.takeAction(response, roomie_id, steward, function(status) {
	    				console.log("Status: " + status);
			    		if (callback) callback(status);
					});

				}
		    } else {
				console.log("Error: No outcome");
			}
        } else {} //###TODO: Error Handling Needed Here
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
