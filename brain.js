var wit     = require('./wit'),
    steward = require('./steward'),
    sphinx = require('./sphinx');

var init = function(callback) {
    //Initialize the steward
    steward.init(init_callback, update_callback);
}
module.exports.init = init;

var init_callback = function(data) {
    //###This line is NEEDED to launch the sphinx listener!
    //sphinx.launch(null,speech_received,null);

    //This line is just for testing...
    speech_received("flip the light off");
}

var update_callback = function(data) {

}

var manage_callback = function(data) {
    console.log(JSON.stringify(data, null, 4));
}

var speech_received = function(command) {
    //###Removed sphinx.dispose for testing without sphinx running to save on reboots!
    think(command, manage_callback, dispose);
}

var dispose = function() {
}

var think = function(data, final_callback, dispose) {
    var self = this;
    data = data.toString().toLowerCase();
    console.log(data);

    wit.think(data,function(err, response) { 
        if (!err) {
            decide(response, final_callback, dispose);
        } else {} //### Error Handling Needed Here
    });
}

var decide = function(command, final_callback, dispose) {
    console.log("------- Deciding On An Action -------");
/*
    console.log(command.outcome);
    console.log(command['outcome']);
*/
    console.log(JSON.stringify(command,null,4));

    //Make sure there is an outcome
    if (command['outcome']) {
        var outcome = [];
        //Find the intent
        //var intent = command['outcome']['intent'];
        
        var intent = require('./intents/' + command['outcome']['intent']);
        intent.parse(command, steward, respond, final_callback, dispose);
        //####Intelligently fill in the entities
        
        //command['outcome']['entities']['on_off']['value'] = "off";
                
/*
        if (intent == "command_toggle") {
            //console.log("Turning the lights on: " + steward.deviceIdFromName("device/4"));
            //###TODO:  Do we want this to callback? Or just let it fizzle?
            steward.perform(101,"device/4",command['outcome']['entities']['on_off']['value'],null,callback);
            dispose();
        }
        if (command['outcome']['intent'] == "shut_down") {
            dispose();
        }
*/
    }

}

var respond = function(action, final_callback) {
    if (!action.isComplete()) final_callback("Incomplete Action", null);
    else steward.perform(101, action.getDevice(), action.getAction(), action.getParameters(), final_callback);
}

/*
function dispose() {
    //Dispose of the sphinx thread
    sphinx.dispose();
}
*/

