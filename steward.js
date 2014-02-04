var util = require("util");
var WebSocket = require('ws');
var isEqual = require('underscore').isEqual;
var isEmpty = require('underscore').isEmpty;

//Set module-wide variables
var	actors=null,
	active_things=null;

//### Warning! the init_callback function will be called at the 
//    same time as the update function, this may result in
var init = function(init_callback, updates_callback) {
	var self = this;

	if (init_callback == undefined) {
		init_callback = function() {}
	}
	if (updates_callback == undefined) {
		updates_callback = function(data) {}
	}
	
	//Load the actors, active things, then start listening for updates & fire init_callback
	self.actors(function () { self.get_things(function() { self.updates(updates_callback); init_callback() }) });
}
module.exports.init = init;

var deviceIdFromName = function(deviceName) {
	var self = this;
	var device_id = null;

	//console.log(JSON.stringify(self.active_things,null,4));

	for(var devicepath in self.active_things){
		//console.log(devicepath + ": " + JSON.stringify(self.active_things[devicepath],null,4));
		for (var id in self.active_things[devicepath]) {
			if (self.active_things[devicepath][id].name.toLowerCase() == deviceName.toLowerCase()) device_id = id;
		}
	}

	if (device_id != null) {
		return device_id.replace('device/','');
	} else {
		return -1;
	}
}
module.exports.deviceIdFromName = deviceIdFromName;

var updates = function(callback) {
	var self = this;

	var ws = new WebSocket('ws://127.0.0.1:8887/console');
	console.log("Created websocket: updates.");

	ws.onopen = function(event) {
		console.log("Opened websocket to steward: updates.");
	};

	ws.onmessage = function(event) {
		data = JSON.parse(event.data)['.updates'];

		//If the message passed in was an actual update, send it back
		if (data) {
 			//console.log("Update received!\n" + JSON.stringify(data,null,4) + "\n---");

	        	//Check if anything needs updated, and if so, update it
	        	var changed = data.every(function(element, index, array) {
        	        	var has_changed = false; //Track whether or not there were chan$
/*
	        	        console.log("element:", element);
        	        	console.log("thing:  ", active_things[element.whatami][element.$
	                	console.log("Equal? " +  (active_things[element.whatami][elemen$
		                console.log("_.isEqual? " +  _.isEqual(active_things[element.wh$
*/
        		        if (!isEqual(self.active_things[element.whatami][element.whoami].status,element.status)) {
                		        //Status update
                        		self.active_things[element.whatami][element.whoami].status = element.status;
		                        console.log("Updated Status");

	        	                //### Todo: check if there's a magic event associated with this status update
        	        	        //#magicevent

                	        	has_changed = true;
	                	}
	        	        if (!isEqual(self.active_things[element.whatami][element.whoami].info, element.info)) {
        	        	        //Info Update
	        	                self.active_things[element.whatami][element.whoami].info = element.info;
                        		console.log("Updated Info" );

        	                	//### Todo: check if there's a magic event associated with this info update
	                	        //#magicevent

        	                	has_changed = true;
	        	        }
        				if (has_changed) {
	                	        //Update the updated property
        	                	self.active_things[element.whatami][element.whoami].updated = element.updated;
	        	        }
        	        	return has_changed;
			    });

			callback();
		}
	};

	ws.onclose = function(event) {
		console.log("Socket closed: " + event.wasClean );
	};

	ws.onerror = function(event) {
		console.log("Socket error: " + util.inspect(event, {depth: null}));
		try { 
			ws.close (); 
			console.log("Closed websocket.");
		} catch (ex) {}
	}
}
module.exports.updates = updates;

var manage = function(requestID, device_path, action, parameter, callback) {
	var ws = new WebSocket('ws://127.0.0.1:8887/manage');
	console.log("Created websocket: manage.");

	ws.onopen = function(event) {
		console.log("Opened websocket to steward: manage..");
		var json = JSON.stringify({path:device_path, 
                        requestID : requestID,
                        perform   : action,
                	parameter : parameter 
			});
		ws.send(json);
	};

	ws.onmessage = function(event) {
		callback(JSON.parse(event.data));
		ws.close();
	};

	ws.onclose = function(event) {
		console.log("Socket closed: manage: " + event.wasClean );
	};

	ws.onerror = function(event) {
		console.log("Socket error: " + util.inspect(event, {depth: null}));
		try { 
		        ws.close (); 
			console.log("Closed websocket.");
		} catch (ex) {}
	};
}
module.exports.manage = manage;

/*
var toggle = function(requestID, deviceName, parameter, callback) {
    var self = this;
	var deviceID;

	self.perform(requestID+1, deviceID, 'on', parameter, function() { self.perform(requestID, deviceID, 'off', parameter, callback)  });
}
module.exports.toggle = toggle;
*/

var perform = function(requestID, deviceName, action, parameter, callback) {
	var deviceID = this.deviceIdFromName(deviceName);
    this.manage(requestID, '/api/v1/device/perform/' + deviceID, action, parameter, callback);
}
module.exports.perform = perform;

var actors = function(callback) {
	var self = this;

	var ws = new WebSocket('ws://127.0.0.1:8887/manage');
	console.log("Created websocket: actors.");

	ws.onopen = function(event) {
		console.log("Opened websocket to steward: actors.");
		var json = JSON.stringify({ path:'/api/v1/actor/list', 
                	requestID :'1', 
                        options   :{ depth: 'all' }
		});
		ws.send(json);
	};

	ws.onmessage = function(event) {
        var json_data = JSON.parse(event.data);
        self.actors = json_data['result']['actors'];
        //console.log(JSON.stringify(self.actors,null,4));
		callback();
		ws.close();
	};

	ws.onclose = function(event) {
		console.log("Actors Socket closed: " + event.wasClean );
	};

	ws.onerror = function(event) {
		console.log("Actors Socket error: " + util.inspect(event, {depth: null}));
		try { 
		        ws.close(); 
			console.log("Closed websocket: actors.");
		} catch (ex) {}
	};
}
module.exports.actors = actors;

var get_things = function(callback) {
	var self = this;

        var ws = new WebSocket('ws://127.0.0.1:8887/manage');
        console.log("Created websocket: Get Things.");

        ws.onopen = function(event) {
                console.log("Opened websocket to steward: Get Things.");
                var json = JSON.stringify({ path:'/api/v1/actor/list',
                        requestID :'1',
                        options   :{ depth: 'all' }
                });
                ws.send(json);
        };

        ws.onmessage = function(event) {
                var json_data = JSON.parse(event.data);
                delete json_data['result']['actors'];
		self.active_things = json_data['result'];
		//console.log(JSON.stringify(self.active_things,null,4));
		callback();
                ws.close();

        };

        ws.onclose = function(event) {
                console.log("Get Things Socket closed: " + event.wasClean );
        };

        ws.onerror = function(event) {
                console.log("Get Things Socket error: " + util.inspect(event, {depth: null}));
                try {
                        ws.close();
                        console.log("Closed websocket: Get Things..");
                } catch (ex) {}
        };
}
module.exports.get_things = get_things;

var get_value = function(whoami, whatami) {
    var self = this;

    if (isEmpty(whatami)) {
        //### Find out whatami based on whoami!
        console.log("JSON as is in get_value\n" + JSON.stringify(self.active_things,null,4));
        //If you can't find whatami, return null;
    }

    return self.active_things[whatami][whoami].status;
}
module.exports.get_value = get_value;

var has_changed = function(thing, update) {
	var ret;

	ret = v.every(function(element, index, array) {
		console.log("element:", element);
		if (element >= THRESHOLD) {
			return true;
		}
		return false;
	});
}
