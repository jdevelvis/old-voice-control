var steward = require('./steward');

steward.init(init_callback, null, meta_callback);

function init_callback(data) {
//    steward.getGroups(done_callback);
//    steward.createGroup("Living Room","LivingRoom1",['device/4',"device/2"],done_callback);
//    steward.deleteGroup(1, done_callback);
}

function meta_callback(data) {
    console.log("---------------------- test script -----------------------");
    console.log("Living Room: " + JSON.stringify(steward.getGroup(steward.getGroupIDByName("Living Room")),null,4));
    console.log("device/4 Exists: " + steward.deviceExists("device/4"));
    console.log("asdf/4 Exists: " + steward.deviceExists("asdf/2"));
    console.log("Living Room Exists: " + steward.deviceExists(steward.getDeviceIDByName("Living Room")));

    console.log("device/4 exists in Living Room: " + steward.deviceExistsInGroup("device/4","group/1"));
    console.log("device/44 exists in Living Room: " + steward.deviceExistsInGroup("device/44","group/1"));
    console.log("device/4 exists in group/1002m: " + steward.deviceExistsInGroup("device/4","group/1002m"));
    
    console.log("device/4 has action 'on' " + steward.actionExists("device/4","on"));
    console.log("device/4 has action 'off' " + steward.actionExists("device/4","off"));
    console.log("device/4 has action 'toggle' " + steward.actionExists("device/4","toggle"));
}

var done_callback = function() {
    console.log("done");
}
