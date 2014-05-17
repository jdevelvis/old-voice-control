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
		updates_callback = function(data) { console.log("Missing Update Callback Function"); }
	}
    if (meta_callback == undefined) {
        meta_callback = function(data) {}
    }
	
	//Load the actors, active things, then start listening for updates & fire callbacks
    self.actors(function () { 
        self.getThings(function() {
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
			var status_changed = false;
			var info_changed = false;
			var now = new Date().getTime();

			console.log(JSON.stringify(data,null,4));

 			console.log("Update received!\n" + JSON.stringify(data,null,4) + "\n---");

        	//Check if anything needs updated, and if so, update it
        	var changed = data.every(function(element, index, array) {
				console.log("inside data.every");
                if(!isEmpty(self.active_things[element.whatami])) {
					var last_update = new Date(self.active_things[element.whatami][element.whoami].updated);
					console.log("Time elapsed since last command: " + now - last_update.getTime());
       		        if (!isEqual(self.active_things[element.whatami][element.whoami].status,element.status) ||
						(now - self.active_things[element.whatami][element.whoami].updated) > 5000) { //###Is 5 seconds a good amount of time to wait between commands?
           		        //Status update
                   		self.active_things[element.whatami][element.whoami].status = element.status;
                        console.log("Updated Status");
           	        	status_changed = true;
                	}
        	        if (!isEqual(self.active_things[element.whatami][element.whoami].info, element.info) ||
						(now - self.active_things[element.whatami][element.whoami].updated) > 5000) { //###Is 5 seconds a good amount of time to wait between commands?
   	        	        //Info Update
    	                self.active_things[element.whatami][element.whoami].info = element.info;
                   		console.log("Updated Info. JSON: " + JSON.stringify(element,null,4) );
      	               	info_changed = true;
        	        }
       				if (status_changed || info_changed) {
               	        //Update the updated property
   	                	self.active_things[element.whatami][element.whoami].updated = element.updated;
						console.log("whatami? " + element.whatami + " -- whoami? " + element.whoami);
						callback(element, status_changed, info_changed);
					}
                } else {//###Likely meaning here - this device was just added!
                   console.log(JSON.stringify(element,null,4));
                }
			});
		}
	};

	ws.onclose = function(event) {
		//###TODO: Connection died for some reason. Reopen updates socket?
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
		var json = {path:device_path,
                        requestID : requestID,
                        perform   : action
            }
		if (!isEmpty(parameter)) json['parameter'] = JSON.stringify(parameter);

		json = JSON.stringify(json);
        console.log(json);
		ws.send(json);
	};

	ws.onmessage = function(event) {
		console.log(JSON.stringify(JSON.parse(event.data),null,4));
		if (!!callback) callback(JSON.parse(event.data));
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
        whatami = self.getWhatAmI(whoami);
        if (!isEmpty(whatami)) {
            console.log("JSON as is in getStatus: whatami=" + whatami + "\n" + JSON.stringify(self.active_things[whatami],null,4));
            return self.active_things[whatami][whoami].status;
        }        
    }

    return false;
}
module.exports.getStatus = getStatus;

var getWhatAmI = function(whoami) {
    var self = this;

    for (var whatami in this.active_things) {
        //console.log
        if (this.active_things[whatami].hasOwnProperty(whoami)) return whatami;
    }
}
module.exports.getWhatAmI = getWhatAmI;

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

var getGroup = function(group_id, group_name, device_id) {
    var self = this;
    if (isEmpty(self.groups)) return false;

	if (!isEmpty(group_id)) {
		if (!isEmpty(self.groups[group_id])) {
			group = self.groups[group_id];
			group['id'] = group_id;
			return group;
		}
	} 

	//If we get here, we couldn't find the group by id
	if (!isEmpty(group_name)) {
		 //ignore case, remove any trailing or leading spaces
	    group_name = group_name.toLowerCase().trim();

    	for(var gid in self.groups) {
        	console.log(gid+": "+self.groups[gid].name);
	        if (self.groups[gid].name.toLowerCase().trim() == group_name) {
				//Found It!
	            group = self.groups[gid];
    	        group['id'] = gid;
        	    return group;
			}
	    }	
	}
	
	//If we get here, we couldn't find group by id or name
	if (!isEmpty(device_id)) { //Find by device_id
	    for(var gid in self.groups) {
			//console.log(gid+": "+self.groups[gid].name);
	        var group = self.groups[gid];

        	for(var key in group['members']) {
	            if(group['members'][key] == device_id) {
					group['id'] = gid;
					return group;
				}
    	    }
	    }
	}

    return false; //if we get here, we didn't find a group
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

var modifyGroup = function(group_id, group_name, devices, callback) {
    var self = this;

    var ws = new WebSocket('ws://127.0.0.1:8887/manage');
    console.log("Created websocket: modifyGroup.");

    ws.onopen = function(event) {
        console.log("Opened websocket to steward: modifyGroup");

		var group_id_number = group_id.split('/')[1];

   	    var json = { path:'/api/v1/group/modify/' + group_id_number,
                requestID :'1'
        }
		if (!isEmpty(group_name)) {
			json['name'] = group_name;
		}
		if (!isEmpty(devices)) {
			json['members'] = devices;
		}

        console.log('>>>' + JSON.stringify(json,null,4) + '<<<');
   	    ws.send(JSON.stringify(json,null,4));
    };

    ws.onmessage = function(event) {
        var json_data = JSON.parse(event.data);
        console.log("Message Returned: " + JSON.stringify(json_data,null,4));
        if (callback) callback();
		ws.close();
    };

    ws.onclose = function(event) {
        console.log("modifyGroup Socket closed: " + event.wasClean );
    };

    ws.onerror = function(event) {
        console.log("modifyGroup Socket error: " + util.inspect(event, {depth: null}));
        try {
            ws.close();
            console.log("Closed websocket: modifyGroup..");
        } catch (ex) {}
    };

}
module.exports.modifyGroup = modifyGroup;

var addDeviceToGroup = function(group_id, device_id, callback) {
	var self = this;
	var group = self.getGroup(group_id);

	if (!isEmpty(group)) {
		if (!self.deviceExistsInGroup(group_id, device_id)) {
			group['members'].push(device_id);
			self.modifyGroup(group_id,null,group['members'],callback);
		}
	}

}
module.exports.addDeviceToGroup = addDeviceToGroup;

var removeDeviceFromGroup = function(group_id, device_id, callback) {
	var self = this;
    var group = self.getGroup(group_id);

    if (!isEmpty(group)) {
        if (self.deviceExistsInGroup(group_id, device_id)) {
			array = group['members'];
			for(var i = array.length - 1; i >= 0; i--) {
			    if(array[i] === device_id) {
					array.splice(i, 1);
					break;
			    }
			}
            self.modifyGroup(group_id,null,array,callback);
        }
    }

}
module.exports.removeDeviceFromGroup = removeDeviceFromGroup;

var deviceExistsInGroup = function(group_id, device_id) {
    var self = this;

    var group = self.getGroup(group_id);

    if (isEmpty(group)) return false; //No group? No use executing the rest

    //console.log("Found group: " + JSON.stringify(group,null,4));

    return (group['members'].indexOf(device_id) > -1);
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

var getDeviceList = function(device_names, group_id, actions, parameters) {
	//###TODO - Should this be replaced by a function that returns whatami AND whoami?
	//To further aid the intent code in determining the best action to take? Or will
	//that create more confusion, since any whatami can be added at any time, and
	//if it's not hard coded, could cause problems. OR maybe having that could help
	//with device-specific stuff that isn't as easy to assume? 60/40 in favor of
	//providing the whatami data... Just in case...
    var self = this;
	var devices = [];

	if (!isEmpty(device_names)) { //We're looking for specific device names
//		console.log('device_names is not empty: ' + JSON.stringify(device_names));
		//clean up device_names array members - make sure they're lower case & trimmed

		//console.log('typeof ' + typeof device_names);

		if( typeof device_names !== 'array' ) {
		    device_names = [ device_names.toLowerCase().trim() ];
		} else {
			for (var key in device_names) {
			    device_names[key] = device_names[key].toLowerCase().trim();
			}
		}

		//console.log(device_names.indexOf('asfd'));
		
		//gather devices that fit the bill
    	for(var whatami in self.active_things) {
        	for (var whoami in self.active_things[whatami]) {
//				console.log("device name match? " + 
//				device_names.indexOf(self.active_things[whatami][whoami]['name'].toLowerCase().trim()));
            	if (device_names.indexOf(self.active_things[whatami][whoami]['name'].toLowerCase().trim()) > -1) {
                	 devices.push({'whatami':whatami,'id':whoami});
        	    }
    	    }
	    }
	} else if (!isEmpty(actions) || !isEmpty(parameters)) { //Time to try to infer if we can
		//###This currently checks based on group members. 
	    var options = [];
    	var remaining = [];

//	    console.log("Inferring Devices using actions/parameters - Begin");
//    	console.log("Group ID: " + group_id);

	    var group = self.getGroup(group_id);
		//###TODO - This needs to be an if statement, not a kill switch. We can still try to assume things
		//without a group id... What if it's the only Thing in the house? (like a Thermostat)
		console.log("Group: " + JSON.stringify(group,null,4));
    	if (group != false) { //If there IS a group, narrow down by group
			console.log('Group Members: ' + JSON.stringify(group['members'],null,4));
    		options = group['members'];
		} else {
			//If there is NOT a group, use all devices 
			//console.log("Actors: " + JSON.stringify(self.active_things, null,4));
			for (var whatami in self.active_things) {
				for (var whoami in self.active_things[whatami]) {
					options.push(whoami);
				}
			}
		}
//		console.log("Available Device IDs: " + JSON.stringify(options,null,4));

		//Make sure actions & parameters are in arrays
        if (!isEmpty(actions) && !Array.isArray(actions)) actions = [ actions ];
        if (!isEmpty(parameters) && !Array.isArray(parameters)) parameters = [ parameters ];

//		console.log("Parameters: " + JSON.stringify(parameters));

    	//Narrow down by actions & parameters
	    for(var i=0; i<options.length; i++) {
//			console.log("================ Device: " + options[i] + "================");
    	    var hasAll = true;
			if (!isEmpty(actions)) {
	      	    for(var x=0; x<actions.length; x++) {
   		            //We need to check if this device has all of the actions in this array
        	        hasAll = hasAll && self.deviceHasAction(options[i], actions[x]);
//            	   	console.log("Action - " + actions[x] + " -- Device Has Action: " + self.deviceHasAction(options[i], actions[x]) + " -- hasAll: " + hasAll);
	           	}
			}
			if (!isEmpty(parameters)) {
	            for(var x=0; x<parameters.length; x++) {
    	           	hasAll = hasAll && self.deviceHasParameter(options[i], parameters[x]);
//        	   	    console.log("Parameter - " + parameters[x] + " -- hasAll: " + hasAll);
       	    	}
			}
	        if (hasAll)  {
            	//If the device has all the actions we need, keep it
        	    remaining.push(options[i]);
    	    }
	    }

		//Add whatami to list and set to devices var for return
		for (var i in remaining) {
			devices.push({'whatami':self.getWhatAmI(remaining[i]),'id':remaining[i]});
		}

		/*############### - Should this be moved to beginning to strip out plurals since
		//					our search is for singles? YES
		//###############
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
		*/
	}

	if (!isEmpty(devices)) return devices;
	else return false;
}
module.exports.getDeviceList = getDeviceList;

var deviceHasAction = function (device_id, action) {
	var self = this;

	var whatami = self.getWhatAmI(device_id);
//	console.log("whatami: " + whatami + " -- device_id " + device_id);
    if (!isEmpty(whatami)) {
//		console.log('Inside whatami');
		if (!isEmpty(self.actors[whatami]['perform'])) {
//			console.log('Has perform section: ' + (self.actors[whatami]['perform'].indexOf(action) >= 0));
	        return (self.actors[whatami]['perform'].indexOf(action) >= 0)
		}
    }
       
    return false; //If we get here, we didn't even find the device...
}
module.exports.deviceHasAction = deviceHasAction;

var deviceHasParameter = function (device_id, parameter) {
	var self = this;

	var whatami = self.getWhatAmI(device_id);

    if (!isEmpty(whatami)) {
		if (!isEmpty(this.actors[whatami]['properties'])) {
	        return !isEmpty(this.actors[whatami]['properties'][parameter]);
		}
    }

     return false; //If we get here, we didn't even find the device...
}
module.exports.deviceHasParameter = deviceHasParameter;

var getDeviceObject = function(device_id) {
	var self = this;

	///console.log("active things: " + JSON.stringify(self.active_things,null,4));

	for (var i in self.active_things) {
		for (var whoami in self.active_things[i]) {
			if (whoami == device_id) { //Found it!
				return self.active_things[i][whoami];
			}
		}
	}
	//If we get here, we didn't find the device
	return false;
}
module.exports.getDeviceObject = getDeviceObject;

var getParameter = function(device_id, parameter) {
	var self = this;

	//###Should this loop be put into a separate function called getDevice that returns
	//   the device object?

	var device = self.getDeviceObject(device_id);


	console.log("Device: " + JSON.stringify(device,null,4));
	console.log("Info: " + JSON.stringify(device['info'],null,4));
	console.log(parameter + ": " + JSON.stringify(device['info'][parameter],null,4));

	if (!isEmpty(device['info']) && !isNaN(device['info'][parameter])) {
		console.log("returning: " + device['info'][parameter]);
		return device['info'][parameter];
	} else {
		return false;
	}

	//If we get here, we didn't find the parameter
	return false;
}
module.exports.getParameter = getParameter;

/*
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
module.exports.inferDevices = inferDevices;
*/
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
