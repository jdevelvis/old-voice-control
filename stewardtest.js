steward = require('./steward');

steward.init(init_callback);

function init_callback(data) {
//	console.log("addDeviceToGroup: " + steward.addDeviceToGroup('group/1','device/6'));
//    console.log("getGroup basement: " + JSON.stringify(steward.getGroup(null,'basement',null),null,4));

//	console.log("removeDeviceFromGroup: " + steward.removeDeviceFromGroup('group/1','device/2'));
//    console.log("getGroup basement: " + JSON.stringify(steward.getGroup(null,'basement',null),null,4));
	

	console.log("==================== getGroup Tests ====================");
    console.log("getGroup basement: " + JSON.stringify(steward.getGroup(null,'basement',null),null,4));
/*
    console.log("getGroup ID=1: " + JSON.stringify(steward.getGroup(1),null,4));
    console.log("getGroup ID=group/1: " + JSON.stringify(steward.getGroup('group/1'),null,4));
    console.log("getGroup device_id=device/9: " + JSON.stringify(steward.getGroup(null,null,'device/9'),null,4));
    console.log("getGroup device_id=device/1118: " + JSON.stringify(steward.getGroup(null,null,'device/1118'),null,4));

	console.log("\n\n==================== getDevices Tests ====================");
	console.log("getDeviceList('CA600 Wall Dimmer'): " + JSON.stringify(steward.getDeviceList('CA600 Wall Dimmer'),null,4));
	console.log("getDeviceList(null, null, ['on','off']): " + JSON.stringify(steward.getDeviceList(null, null, ['on','off'])),null,4);
	console.log("getDeviceList(null, null, ['on','off'],'level'): " + JSON.stringify(steward.getDeviceList(null, null, ['on','off'],'level'),null,4));
	console.log("getDeviceList(null, null, ['on']): " + JSON.stringify(steward.getDeviceList(null, null, ['on']),null,4));
	console.log("getDeviceList(null, null, 'on'): " + JSON.stringify(steward.getDeviceList(null, null, 'on'),null,4));
	console.log("getDeviceList(null, null, ['on'],['level']): " + JSON.stringify(steward.getDeviceList(null, null, ['on'],['level']),null,4));
	console.log("getDeviceList(null, 'group/1', ['on']): " + JSON.stringify(steward.getDeviceList(null, 'group/1', ['on']),null,4));
	console.log("getDeviceList(null, 'group/1', ['asdf']): " + JSON.stringify(steward.getDeviceList(null, 'group/1', ['asdf']),null,4));
	console.log("getDeviceList(null, null, ['asdf']): " + JSON.stringify(steward.getDeviceList(null, null, ['asdf']),null,4));
	console.log("getDeviceList(null, null, ['on'],['asdf']): " + JSON.stringify(steward.getDeviceList(null, null, ['on'],['asdf']),null,4));

	console.log("\n\n==================== End Tests ====================");
	console.log("steward.getParameter('device/9','level')" + steward.getParameter('device/9','level'));
	console.log("steward.getParameter('device/10','level')" + steward.getParameter('device/10','level'));
	console.log("steward.getParameter('device/8','level')" + steward.getParameter('device/8','level'));
	console.log("steward.getParameter('device/9','on')" + steward.getParameter('device/9','on'));
*/


	console.log("\n\n==================== End Tests ====================");



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
