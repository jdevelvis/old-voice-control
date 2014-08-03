var steward = require('./steward');

steward.init(init_callback, null, meta_callback);

function init_callback(data) {
    steward.getGroups(done_callback);
//    steward.createGroup("Living Room","LivingRoom1",['device/9','device/7'],done_callback);
//    steward.createGroup("Bedroom","Bedroom1",['device/8'],done_callback);
//    steward.deleteGroup(1, done_callback);
//	steward.modifyGroup('group/1','Living Room',['device/8','device/9']);
//	steward.modifyGroup('group/2','Bedroom',['device/7']);
//	console.log('done modifying');
	
}

function meta_callback(data) {
    console.log("---------------------- test script -----------------------");
//	var livingroom = steward.getGroup(null,"Living Room");
	var bedroom = steward.getGroup(null,"Bedroom");
    console.log("Bedroom: " + JSON.stringify(bedroom,null,4));
/*    console.log("Living Room: " + JSON.stringify(livingroom,null,4));
    console.log("device/4 Exists: " + steward.deviceExists("device/4"));
    console.log("asdf/4 Exists: " + steward.deviceExists("asdf/2"));

    console.log("device/9 exists in Living Room: " + steward.deviceExistsInGroup("device/9",livingroom.id));
*/
    console.log("device/8 exists in Bedroom: " + steward.deviceExistsInGroup("device/8",steward.getGroup(null,"Bedroom").id));
/*    console.log("device/44 exists in Living Room: " + steward.deviceExistsInGroup("device/44",livingroom.id));
    console.log("device/9 exists in group/1002m: " + steward.deviceExistsInGroup("device/9","group/1002m"));
    
    console.log("device/8 has action 'on' " + steward.actionExists("device/8","on"));
    console.log("device/8 has action 'off' " + steward.actionExists("device/8","off"));
    console.log("device/8 has action 'toggle' " + steward.actionExists("device/8","toggle"));
*/
//	console.log(JSON.stringify(steward.getGroups(),null,4));
	//steward.createGroup(
}

var done_callback = function() {
    console.log("done");
}
