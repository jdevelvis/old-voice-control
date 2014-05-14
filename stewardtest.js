steward = require('./steward');

steward.init(init_callback);

function init_callback(data) {
/*    console.log("getGroup basement: " + JSON.stringify(steward.getGroup(null,'basement',null),null,4));
    console.log("getGroup ID=1: " + JSON.stringify(steward.getGroup(1),null,4));
    console.log("getGroup ID=group/1: " + JSON.stringify(steward.getGroup('group/1'),null,4));
    console.log("getGroup device_id=device/9: " + JSON.stringify(steward.getGroup(null,null,'device/9'),null,4));
	console.log("getDevices('CA600 Wall Dimmer'): " + JSON.stringify(steward.getDevices('CA600 Wall Dimmer'),null,4));
*/
	console.log("getDevices(null, null, ['on','off']): " + steward.getDevices(null, null, ['on','off']));

/*
	console.log("getDevices(null, null, ['on','off'],'level'): " + steward.getDevices(null, null, ['on','off'],'level'));
	console.log("getDevices(null, null, ['on']): " + steward.getDevices(null, null, ['on']));
	console.log("getDevices(null, null, 'on'): " + steward.getDevices(null, null, 'on'));
	console.log("getDevices(null, null, ['on'],['level']): " + steward.getDevices(null, null, ['on'],['level']));
*/


    //console.log("Has action 'asdf': " + steward.deviceHasAction('device/1','asdf'));

    //console.log("Groups: " + steward.getGroupIDByName('nothing'));
    //console.log(steward.createGroup('Basement','basement',['device/2','device/9','device/10'], function() {}));

    //All Lights group includes Dimmer in basement & outlet upstairs
/*
    console.log("------\nExpected: object - possible options for what this device could be");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("light",steward.getGroupIDByName('basement'),['on','off']));
    
    console.log("------\nExpected: device/14 - there is only one dimmer in the basement");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("lights",steward.getGroupIDByName('basement'),['on','off']));

    console.log("------\nExpected: device/14 - there is only one light in the basement");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("lights",steward.getGroupIDByName('All Lights'),['on','off'],['level']));

    console.log("------\nExpected: false - there are no dimmers in the living room");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("dimmer",steward.getGroupIDByName('Living Room'),['on','off'],['level']));

    console.log("------\nExpected: device/1 - the is a fan switch in the living room");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("fan",steward.getGroupIDByName('Living Room'),['on','off']));

    console.log("------\nExpected: device/4 - there is an outlet in the living room");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("outlet",steward.getGroupIDByName('Living Room'),['on','off'],['level']));

    console.log("------\nExpected: false - there is not an outlet in the basement");
    console.log("== getDeviceIDByReference: " + steward.getDeviceIDByReference("outlet",steward.getGroupIDByName('basement'),['on','off'],['level']));
*/
/*
    steward.deleteGroup(11,function(){});
    steward.deleteGroup(4,function(){});
    steward.deleteGroup(5,function(){});
    steward.deleteGroup(6,function(){});
    steward.deleteGroup(7,function(){});
    steward.deleteGroup(8,function(){});
    steward.deleteGroup(9,function(){});
    steward.deleteGroup(10,function(){});
*/
}
