//EHMA web client code for working with the steward

//Create Steward Object
function steward() {
//Set module-wide variables
	this.actors=null;
	this.active_things=null;
	this.groups=null;
	this.places=null;
    this.events=null;
	this.tasks=null;
}

//### Warning! the init_callback function will be called at the 
//    same time as the update function, this may result in issues
steward.prototype.init = function(init_callback, updates_callback, meta_callback) {
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
    self.getActors(function () { 
        self.getThings(function() {
            self.getUpdates(updates_callback); 
            self.getMeta(function() {
                meta_callback();
                init_callback();
            });
        }); 
    });
}

steward.prototype.connect = function(endpoint) {
	return new WebSocket('ws://' + document.domain + ':8887/' + endpoint);
}

//###TODO - Set Websockets to wss:// & do TOTP connections
steward.prototype.getUpdates = function(callback) {
	var self = this;

	var ws = self.connect("console");
	console.log("Created websocket: updates.");

	ws.onopen = function(event) {
		console.log("Opened websocket to steward: updates.");
	};

	ws.onmessage = function(event) {
		data = JSON.parse(event.data)['.updates'];

		//If the message passed in was an actual update, send it back
		if (!_.isEmpty(data)) {
			var status_changed = false;
			var info_changed = false;
			var now = new Date().getTime();

//			console.log(JSON.stringify(data,null,4));

 			console.log("Update received!\n" + JSON.stringify(data,null,4) + "\n---");

        	//Check if anything needs updated, and if so, update it
        	var changed = data.every(function(element, index, array) {
				console.log("inside data.every");
                if(!_.isEmpty(self.active_things[element.whatami])) {
					var last_update = new Date(self.active_things[element.whatami][element.whoami].updated);
					console.log("Time elapsed since last command: " + now - last_update.getTime());
       		        if (!_.isEqual(self.active_things[element.whatami][element.whoami].status,element.status) ||
						(now - self.active_things[element.whatami][element.whoami].updated) > 5000) { //###Is 5 seconds a good amount of time to wait between commands?
           		        //Status update
                   		self.active_things[element.whatami][element.whoami].status = element.status;
                        console.log("Updated Status");
           	        	status_changed = true;
                	}
        	        if (!_.isEqual(self.active_things[element.whatami][element.whoami].info, element.info) ||
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

steward.prototype.manage = function(requestID, device_path, action, parameter, callback) {

	var ws = this.connect('manage');
	console.log("Created websocket: manage.");

	ws.onopen = function(event) {
		console.log("Opened websocket to steward: manage..");
		var json = {path:device_path,
                        requestID : requestID,
                        perform   : action
            }
		if (!_.isEmpty(parameter)) json['parameter'] = JSON.stringify(parameter);

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

steward.prototype.perform = function(requestID, device, action, parameter, callback) {
    console.log("Performing action: '" + action + "' on " + device + ". Parameters: " + parameter);
    if (!this.deviceExists(device)) {
	    device = this.getDeviceIDByName(device);
    }
    if (!_.isEmpty(device)) {
        var deviceIDNumber = device.replace('device/','');
    }

    if (isNaN(deviceIDNumber)) {
        console.log("Device not Found: " + device);
        return false;
    }

    this.manage(requestID, '/api/v1/device/perform/' + deviceIDNumber, action, parameter, callback);
}

steward.prototype.getActors = function(callback) {
	var self = this;

    var ws = this.connect('manage');
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

steward.prototype.getThings = function(callback) {
	var self = this;

    var ws = this.connect('manage');
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

steward.prototype.getStatus = function(whoami, whatami) {
    var self = this;

    if (_.isEmpty(whatami)) {
        //### Find out whatami based on whoami!
        whatami = self.getWhatAmI(whoami);
        if (!_.isEmpty(whatami)) {
            console.log("JSON as is in getStatus: whatami=" + whatami + "\n" + JSON.stringify(self.active_things[whatami],null,4));
            return self.active_things[whatami][whoami].status;
        }        
    }

    return false;
}

steward.prototype.getWhatAmI = function(whoami) {
    var self = this;

    for (var whatami in this.active_things) {
        //console.log
        if (this.active_things[whatami].hasOwnProperty(whoami)) return whatami;
    }
}

steward.prototype.getMeta = function(callback) {
    var self = this;

    var ws = this.connect('manage');
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

steward.prototype.getGroup = function(group_id, group_name, device_id) {
    var self = this;
    if (_.isEmpty(self.groups)) return false;

	if (!_.isEmpty(group_id)) {
		if (!_.isEmpty(self.groups[group_id])) {
			group = self.groups[group_id];
			group['id'] = group_id;
			return group;
		}
	} 

	//If we get here, we couldn't find the group by id
	if (!_.isEmpty(group_name)) {
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
	if (!_.isEmpty(device_id)) { //Find by device_id
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

steward.prototype.createGroup = function(name, UUID, deviceNames, callback) {
    var self = this;

    var ws = this.connect('manage');
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

steward.prototype.deleteGroup = function(ID, callback) {
    var self = this;

    var ws = this.connect('manage');
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

steward.prototype.modifyGroup = function(group_id, group_name, devices, callback) {
    var self = this;

    var ws = this.connect('manage');
    console.log("Created websocket: modifyGroup.");

    ws.onopen = function(event) {
        console.log("Opened websocket to steward: modifyGroup");

		var group_id_number = group_id.split('/')[1];

   	    var json = { path:'/api/v1/group/modify/' + group_id_number,
                requestID :'1'
        }
		if (!_.isEmpty(group_name)) {
			json['name'] = group_name;
		}
		if (!_.isEmpty(devices)) {
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

steward.prototype.addDeviceToGroup = function(group_id, device_id, callback) {
	var self = this;
	var group = self.getGroup(group_id);

	if (!_.isEmpty(group)) {
		if (!self.deviceExistsInGroup(group_id, device_id)) {
			group['members'].push(device_id);
			self.modifyGroup(group_id,null,group['members'],callback);
		}
	}

}

steward.prototype.removeDeviceFromGroup = function(group_id, device_id, callback) {
	var self = this;
    var group = self.getGroup(group_id);

    if (!_.isEmpty(group)) {
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

steward.prototype.deviceExistsInGroup = function(group_id, device_id) {
    var self = this;

    var group = self.getGroup(group_id);

    if (_.isEmpty(group)) return false; //No group? No use executing the rest

    //console.log("Found group: " + JSON.stringify(group,null,4));

    return (group['members'].indexOf(device_id) > -1);
}

steward.prototype.actionExists = function(deviceID, action) {
    var self = this;
    var exists = false;

    //Determine the actor type
    for(var whatami in self.active_things) {
        if(!_.isEmpty(self.active_things[whatami][deviceID])) {
            for(var key in self.actors[whatami]['perform']) {
                if (self.actors[whatami]['perform'][key] == action) return true;
            }
        }
    }

    //If we get here, it doesn't exist
    return false;
}

steward.prototype.deviceExists = function(deviceID) {
    var self = this;

    for(var whatami in self.active_things) {
        if(!_.isEmpty(self.active_things[whatami][deviceID])) return true;
    }

    //If we get here, it doesn't exist
    return false;
}

steward.prototype.getDeviceObject = function(device_id) {
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

steward.prototype.getParameter = function(device_id, parameter) {
	var self = this;

	//###Should this loop be put into a separate function called getDevice that returns
	//   the device object?

	var device = self.getDeviceObject(device_id);


	console.log("Device: " + JSON.stringify(device,null,4));
	console.log("Info: " + JSON.stringify(device['info'],null,4));
	console.log(parameter + ": " + JSON.stringify(device['info'][parameter],null,4));

	if (!_.isEmpty(device['info']) && !isNaN(device['info'][parameter])) {
		console.log("returning: " + device['info'][parameter]);
		return device['info'][parameter];
	} else {
		return false;
	}

	//If we get here, we didn't find the parameter
	return false;
}
/*
steward.prototype.hasChanged = function(thing, update) {
	var ret;

	ret = v.every(function(element, index, array) {
		console.log("element:", element);
		if (element >= THRESHOLD) {
			return true;
		}
		return false;
	});
}
*/
