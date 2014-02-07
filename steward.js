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
//    same time as the update function, this may result in
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
	self.actors(function () { self.getThings(function() { self.updates(updates_callback); self.getMeta(meta_callback); init_callback() }) });
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

 			//console.log("Update received!\n" + JSON.stringify(data,null,4) + "\n---");

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
                    } else {//###Likely meaning here - this device was just added!
                        console.log(JSON.stringify(element,null,4));
                    }
			    });

			callback(has_changed);
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

var perform = function(requestID, deviceName, action, parameter, callback) {
	var deviceIDNumber = this.getDeviceIDByName(deviceName).replace('device/','');
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

var getValue = function(whoami, whatami) {
    var self = this;

    if (isEmpty(whatami)) {
        //### Find out whatami based on whoami!
        console.log("JSON as is in get_value\n" + JSON.stringify(self.active_things,null,4));
        //If you can't find whatami, return null;
    }

    return self.active_things[whatami][whoami].status;
}
module.exports.getValue = getValue;

var getMeta = function(callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: getGroups.");

    ws.onopen = function(event) {
            console.log("Opened websocket to steward: getGroups");
            var json = JSON.stringify({ path:'/api/v1/group/list',
                    requestID :'1',
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
                console.log("getGroups Socket closed: " + event.wasClean );
        };

        ws.onerror = function(event) {
                console.log("getGroups Socket error: " + util.inspect(event, {depth: null}));
                try {
                        ws.close();
                        console.log("Closed websocket: getGroups..");

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
        //console.log(groupID+": "+self.groups[groupID].name);
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

var getDeviceIDByName = function(deviceName) {
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
module.exports.getDeviceIDByName = getDeviceIDByName;

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
