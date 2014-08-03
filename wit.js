var https = require('https'),
    bearer_auth = '7DKBTBCSC7UDTG5T73XOOOU4YOSZC4WI', //the bearer_auth to the EHMA wit
	version = '20140501';

var think = function(data, callback) {
	data = data.toLowerCase();
    call_api('message','?q=' + encodeURIComponent(data), callback, 4);

    /* /var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/message?q=' + encodeURIComponent(data),
        // the Authorization header allows you to access your Wit account
        // make sure to replace it with your own
        headers: {'Authorization': 'Bearer ' + bearer_auth}
    };

    https.request(options, function(res) {
        var response = '';

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            //future.fulfill(undefined, JSON.parse(response));
            //console.log("think_callback");
            callback(null, JSON.parse(response));
        });
    }).on('error', function(e) {
        //future.fulfill(e, undefined);
        callback(e,null);
    }).end();
    */
}

var list_expressions = function(callback) {
    call_api('corpus','?',callback, 4);
/*
    var self = this;
    var options = {
        host: 'api.wit.ai',
        path: '/corpus',
        // the Authorization header allows you to access your Wit account
        // make sure to replace it with your own
        headers: {'Authorization': 'Bearer ' + bearer_auth}
    };

    https.request(options, function(res) {
        var response = '';

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            //future.fulfill(undefined, response);
            //console.log("bearer_auth: " + self.bearer_auth);
            //console.log("list response: " + response);
            callback(null,response);
        });
    }).on('error', function(e) {
        callback(e,null);
    }).end();
*/
}

/*
var get_entities = function(intent, callback) {
    this.call_api('
}
*/

var call_api = function(endpoint, data, callback, tries) {
    //var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/' + endpoint + data, //?q=' + encodeURIComponent(data),
        headers: {
			'Authorization': 'Bearer ' + bearer_auth,
			'Accept': 'application/vnd.wit/20140802' //Use API version prior to this date
		}

    };

	console.log(JSON.stringify(options,null,4));

    https.request(options, function(res) {
        var response = '';

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            //future.fulfill(undefined, JSON.parse(response));
            //console.log("think_callback");

//            callback(null,JSON.parse(response));
//            console.log("success!");
            try { //Try to send the JSON object back
//                console.log('----\n' + response + '----');
                response = JSON.parse(response);
               
//                return;
            } catch (e) { //If we got an erroneous response (likely a 404 or 503 error) then try again
                if (tries > 0) {
                    console.log("wit.js call_api: Trying again");
                    setTimeout(call_api, 5000, endpoint, data, callback, tries-1);
                } else {
                    console.log("wit.js call_api: Unable to contact Wit.ai. Giving Up.");
                }
                return;
            }

            //We know it's okay to send this, or we wouldn't be here
            callback(null, response);

        });
    }).on('error', function(e) {
        //future.fulfill(e, undefined);
        callback(e,null);
    }).end();
}

module.exports.think = think;
module.exports.list_expressions = list_expressions;
