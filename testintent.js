var steward = require('./steward.js'),
	dim = require('./intents/command_dim.js'),
	outcome = {
	    "intent": "command_toggle",
    	"entities": {
        	"device": {
        	    "end": 5,
    	        "start": 0,
	            "value": "light",
        	    "body": "light"
    	    },
	        "on_off": {
        	    "value": "on"
    	    }
	    },
    	"confidence": 0.274
	};

//Initialize the steward
steward.init(init_callback, update_callback);

var init_callback = function(data) {
	console.log("In init_callback: " + data);
	dim.takeAction(response, steward, function(status) {
		console.log("Status: " + status);
	});
}

var update_callback = function(element) {
    console.log (">> Update received for: " + JSON.stringify(element,null,4));

    dim.takeAction(response, steward, function(status) {
        console.log("Status: " + status);
    });

/*
    //Check if there's a magic event associated with this update
        //###Todo - Needs to be modified to be dynamic (maybe similar to intent structure)
    //Hard coding for now
        switch (element.whatami) {
                case '/device/sensor/ehma/roomie':
	        	    console.log(element.info.command);
    		        speech_received(element.info.command);
                	break;
        }
*/
}

var manage_callback = function(data) {
//    console.log(JSON.stringify(data, null, 4));
}
