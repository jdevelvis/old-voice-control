steward = require('./steward');

steward.init(init_callback);

function init_callback(data) {
    console.log("Basement Group ID: " + steward.getGroupIDByName('basement'));
    console.log("Has action: " + steward.deviceHasAction('device/4','asdf'));

    //console.log("Groups: " + steward.getGroupIDByName('nothing'));
    //console.log(steward.createGroup('All Lights','allLights',['device/4','device/14'], function() {}));

    //All Lights group includes Dimmer in basement & outlet upstairs

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
