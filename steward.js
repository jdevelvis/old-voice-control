var util = require("util");
var WebSocket = require('ws');
var isEqual = require('underscore').isEqual;
var isEmpty = require('underscore').isEmpty;

//Set module-wide variables
var	actors=null,
	active_things=null,
    groups=null,
    places=null,
    events=null,
    tasks=null;

//### Warning! the init_callback function will be called at the 
//    same time as the update function, this may result in issues
var init = function(init_callback, updates_callback, meta_callback) {
	var self = this;

	if (init_callback == undefined) {
		init_callback = function() {}
	}
	if (updates_callback == undefined) {
		updates_callback = function(data) {}
	}
    if (meta_callback == undefined) {
        meta_callback = function(data) {}
    }
	
	//Load the actors, active things, then start listening for updates & fire init_callback
    self.actors(function () { 
        self.getThings(function() {
        	//### Commenting the updates call to help keep websocket overloading away 
            self.updates(updates_callback); 
            self.getMeta(function() {
                meta_callback();
                init_callback();
            });
        }); 
    });
}
module.exports.init = init;

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
		if (!isEmpty(data)) {
        	var has_changed = false; //Track whether or not there were changed

 			console.log("Update received!\n" + JSON.stringify(data,null,4) + "\n---");

	        	//Check if anything needs updated, and if so, update it
	        	var changed = data.every(function(element, index, array) {
/*
	        	        console.log("element:", element);
        	        	console.log("thing:  ", active_things[element.whatami][element.$
	                	console.log("Equal? " +  (active_things[element.whatami][elemen$
		                console.log("_.isEqual? " +  _.isEqual(active_things[element.wh$
*/
                    if(!isEmpty(self.active_things[element.whatami])) {
        		        if (!isEqual(self.active_things[element.whatami][element.whoami].status,element.status)) {
                		        //Status update
                        		self.active_things[element.whatami][element.whoami].status = element.status;
		                        console.log("Updated Status");

                	        	has_changed = true;
	                	}
	        	        if (!isEqual(self.active_things[element.whatami][element.whoami].info, element.info)) {
        	        	        //Info Update
	        	                self.active_things[element.whatami][element.whoami].info = element.info;
                        		console.log("Updated Info. JSON: " + JSON.stringify(element,null,4) );

        	                	has_changed = true;
	        	        }
       				if (has_changed) {
	                	        //Update the updated property
        	                	self.active_things[element.whatami][element.whoami].updated = element.updated;
					console.log("whatami? " + element.whatami + " -- whoami? " + element.whoami);

					callback(element);
	        	        }
                    } else {//###Likely meaning here - this device was just added!
                        console.log(JSON.stringify(element,null,4));
                    }
		    });
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

/*var doMagic = function(element) {
	//###Needs to be modified to be dynamic. Hard coding for now
	switch (element.whatami) {
		case '/device/sensor/ehma/roomie':
			
		break;
	}
}
*/

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
        console.log(json);
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

var perform = function(requestID, device, action, parameter, callback) {
    console.log("Performing action: '" + action + "' on " + device + ". Parameters: " + parameter);
    if (!this.deviceExists(device)) {
	    device = this.getDeviceIDByName(device);
    }
    if (!isEmpty(device)) {
        var deviceIDNumber = device.replace('device/','');
    }

    if (isNaN(deviceIDNumber)) {
        console.log("Device not Found: " + device);
        return false;
    }

    this.manage(requestID, '/api/v1/device/perform/' + deviceIDNumber, action, parameter, callback);
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

var getThings = function(callback) {
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
module.exports.getThings = getThings;

var getStatus = function(whoami, whatami) {
    var self = this;

    if (isEmpty(whatami)) {
        //### Find out whatami based on whoami!
        whatami = self.getWhatAmIByWhoAmI(whoami);
        if (!isEmpty(whatami)) {
            console.log("JSON as is in getStatus: whatami=" + whatami + "\n" + JSON.stringify(self.active_things[whatami],null,4));
            return self.active_things[whatami][whoami].status;
        }        
    }

    return false;
}
module.exports.getStatus = getStatus;

var getWhatAmIByWhoAmI = function(whoami) {
    var self = this;

    for (var whatami in self.active_things) {
        //console.log
        if (self.active_things[whatami].hasOwnProperty(whoami)) return whatami;
    }
}

var getMeta = function(callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: getMeta.");

    ws.onopen = function(event) {
            console.log("Opened websocket to steward: getMeta");
            var json = JSON.stringify({ path:'/api/v1/group/list',
                    requestID : 'getMeta',
                    options   :{ depth: 'all' }
            });
            ws.send(json);
    };

    ws.onmessage = function(event) {
        var json_data = JSON.parse(event.data);
        //console.log(JSON.stringify(json_data['result']['groups'],null,4));
        self.groups = json_data['result']['groups'];
        self.places = json_data['result']['places'];
        self.events = json_data['result']['events'];
        self.tasks = json_data['result']['tasks'];
        callback(json_data['result']);
        ws.close();
    };

    ws.onclose = function(event) {
        console.log("getMeta Socket closed: " + event.wasClean );
    };

    ws.onerror = function(event) {
        console.log("getMeta Socket error: " + util.inspect(event, {depth: null}));
        try {
           ws.close();
           console.log("Closed websocket: getMeta..");
        } catch (ex) {}
    };    
}
module.exports.getMeta = getMeta;

var getGroupIDByName = function(groupName) {
    var self = this;
    if (isEmpty(self.groups)) return false;

    //ignore case, remove any trailing or leading spaces
    groupName = groupName.toLowerCase().trim();

    for(var groupID in self.groups) {
        console.log(groupID+": "+self.groups[groupID].name);
        if (self.groups[groupID].name.toLowerCase().trim() == groupName)
            return groupID; //Found it!
    }
    //If we get here, we didn't find it...

    return false;    
}
module.exports.getGroupIDByName = getGroupIDByName;

var getGroup = function(groupID) {
    var self = this;
    if (isEmpty(self.groups)) return false;

    return self.groups[groupID];
}
module.exports.getGroup = getGroup;

var createGroup = function(name, UUID, deviceNames, callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: createGroup.");

    ws.onopen = function(event) {
            console.log("Opened websocket to steward: createGroup");

            var json = { path:'/api/v1/group/create/' + UUID,
                    requestID :'201',
                    name: name,
                    members: deviceNames
            }

            //console.log('>>>' + JSON.stringify(json,null,4) + '<<<');
            ws.send(JSON.stringify(json,null,4));
    };

    ws.onmessage = function(event) {
            var json_data = JSON.parse(event.data);
            console.log(JSON.stringify(json_data,null,4));
            ws.close();
    };

    ws.onclose = function(event) {
            console.log("createGroup Socket closed: " + event.wasClean );
    };

    ws.onerror = function(event) {
            console.log("createGroup Socket error: " + util.inspect(event, {depth: null}));
            try {
                    ws.close();
                    console.log("Closed websocket: createGroup..");
            } catch (ex) {}
    };

}
module.exports.createGroup = createGroup;

var deleteGroup = function(ID, callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: deleteGroup.");

    ws.onopen = function(event) {
            console.log("Opened websocket to steward: deleteGroup");

            var json = { path:'/api/v1/group/delete/' + ID,
                    requestID :'1',
            }

            console.log('>>>' + JSON.stringify(json,null,4) + '<<<');
            ws.send(JSON.stringify(json,null,4));
    };

    ws.onmessage = function(event) {
            var json_data = JSON.parse(event.data);
            console.log(JSON.stringify(json_data,null,4));
            callback();
            ws.close();
    };

    ws.onclose = function(event) {
            console.log("deleteGroup Socket closed: " + event.wasClean );
    };

    ws.onerror = function(event) {
            console.log("deleteGroup Socket error: " + util.inspect(event, {depth: null}));
            try {
                    ws.close();
                    console.log("Closed websocket: deleteGroup..");
            } catch (ex) {}
    };

}
module.exports.deleteGroup = deleteGroup;

var addDeviceToGroup = function(ID, name, deviceNames, callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: addDeviceToGroup.");

    ws.onopen = function(event) {
            console.log("Opened websocket to steward: addDeviceToGroup");

            var json = { path:'/api/v1/group/modify/' + ID,
                    requestID :'1',
                    name: name,
                    members: deviceNames
            }

            console.log('>>>' + JSON.stringify(json,null,4) + '<<<');
            ws.send(JSON.stringify(json,null,4));
    };

    ws.onmessage = function(event) {
            var json_data = JSON.parse(event.data);
            console.log(JSON.stringify(json_data,null,4));
            callback();
            ws.close();
    };

    ws.onclose = function(event) {
            console.log("addDeviceToGroup Socket closed: " + event.wasClean );
    };

    ws.onerror = function(event) {
            console.log("addDeviceToGroup Socket error: " + util.inspect(event, {depth: null}));
            try {
                ws.close();
                console.log("Closed websocket: addDeviceToGroup..");
            } catch (ex) {}
    };

}
module.exports.addDeviceToGroup = addDeviceToGroup;

var deviceExistsInGroup = function(deviceID, groupID) {
    var self = this;

    var group = self.getGroup(groupID);

    if (isEmpty(group)) return false; //No group? No use executing the rest

    //console.log("Found group: " + JSON.stringify(group,null,4));

    for(var key in group['members']) {
        if(group['members'][key] == deviceID) return true;
    }

    //If we get here, it doesn't exist
    return false;
}
module.exports.deviceExistsInGroup = deviceExistsInGroup;

var actionExists = function(deviceID, action) {
    var self = this;
    var exists = false;

    //Determine the actor type
    for(var whatami in self.active_things) {
        if(!isEmpty(self.active_things[whatami][deviceID])) {
            for(var key in self.actors[whatami]['perform']) {
                if (self.actors[whatami]['perform'][key] == action) return true;
            }
        }
    }

    //If we get here, it doesn't exist
    return false;
}
module.exports.actionExists = actionExists;

var deviceExists = function(deviceID) {
    var self = this;

    for(var whatami in self.active_things) {
        if(!isEmpty(self.active_things[whatami][deviceID])) return true;
    }

    //If we get here, it doesn't exist
    return false;
}
module.exports.deviceExists = deviceExists;

var getDevicesByName = function(deviceName, groupID) {
	//###TODO - Use groupID to help find specific device if necessary
	//This will require an update below, as right now this function simply returns the
	//first one it finds, it doesn't queue them and check for multiples. It should 
	//do so and then return them all (IE - "Turn off the lights" should turn off
	//all the lights in the room

	//###TODO - Should this be replaced by a function that returns whatami AND whoami?
	//To further aid the intent code in determining the best action to take? Or will
	//that create more confusion, since any whatami can be added at any time, and
	//if it's not hard coded, could cause problems. OR maybe having that could help
	//with device-specific stuff that isn't as easy to assume? 60/40 in favor of
	//providing the whatami data... Just in case...
    var self = this;

    deviceName = deviceName.toLowerCase().trim();

    for(var whatami in self.active_things) {
        for (var whoami in self.active_things[whatami]) {
            if (self.active_things[whatami][whoami]['name'].toLowerCase().trim() == deviceName) {
                return whoami;
            }
        }
    }

    return false;
}
module.exports.getDevicesByName = getDevicesByName;

var deviceHasAction = function (deviceID, action) {
    for (var whatami in this.active_things) {
        if (!isEmpty(this.active_things[whatami][deviceID])) {
            return (this.actors[whatami]['perform'].indexOf(action) >= 0)
        }
    }
        
    return false; //If we get here, we didn't even find the device...
}
module.exports.deviceHasAction = deviceHasAction;

var deviceHasParameter = function (deviceID, parameter) {
    for (var whatami in this.active_things) {
        if (!isEmpty(this.active_things[whatami][deviceID])) {
            return (this.actors[whatami]['properties'].indexOf(parameter) >= 0)
        }
    }

    return false; //If we get here, we didn't even find the device...
}
module.exports.deviceHasParameter = deviceHasParameter;

var inferDevices = function(groupID, actions, parameters) {
    var self = this;
    var device = [];
    var options = [];
    var remaining = [];

    console.log("getDeviceIDByReference - Begin");
    console.log("Group ID: " + groupID);

    var group = getGroup(groupID);
//###TODO - This needs to be an if statement, not a kill switch. We can still try to assume things
//without a group id... What if it's the only Thing in the house? (like a Thermostat)
    if (group == false) return false; //If the group doesn't exist, return false

    //Narrow down by group
    options = group['members'];
    console.log("Available Members In Group: " + JSON.stringify(options,null,4));
    
    //Narrow down by actions & parameters
    for(var i=0; i<options.length; i++) {
        var hasAll = true;
        if (Array.isArray(actions)) {
            for(var x=0; x<actions.length; x++) {
                //We need to check if this device has all of the actions in this array
                hasAll = hasAll && self.deviceHasAction(options[i], actions[x]);
                console.log("Action - " + actions[x] + " -- hasAll: " + hasAll);        
            }
        }
        if (Array.isArray(parameters)) {
            for(var x=0; x<parameters.length; x++) {
                hasAll = hasAll && self.deviceHasParameter(options[i], parameters[x]);
                console.log("Parameter - " + parameters[x] + " -- hasAll: " + hasAll);        
            }
        }
        if (hasAll)  { 
            //If the device has all the actions we need, keep it
            remaining.push(options[i]);
        }
    }

    //Do we have just one yet?
    if (remaining.length == 0) { 
        console.log("nothing remaining");
        return false;
    } else if (remaining.length == 1) {
        console.log("One Remaining: " + remaining[0]);
        //If there's only one, return the first element in the array, it's our only device ID
        return remaining[0];
    }

    //If we're still here, remaining has more than one member
    //###TODO-language: When integrating other languages into code, don't forget this call!
    //Is reference plural? 
    var language = require('smart-plurals').plurals.getRule('en');
    if (language(reference,[false, true])) {
        //###Todo - If plural, create group & return group ID?
        console.log("is plural");
    } else {
        //If not plural, check for similarities between names & reference
        console.log("not plural");
    }

    //If one Thing left, return ID
    //If more than one, throw error
}
module.exports.getDeviceIDByReference = getDeviceIDByReference;

var hasChanged = function(thing, update) {
	var ret;

	ret = v.every(function(element, index, array) {
		console.log("element:", element);
		if (element >= THRESHOLD) {
			return true;
		}
		return false;
	});
}
