var https = require('https'),
    bearer_auth = '7DKBTBCSC7UDTG5T73XOOOU4YOSZC4WI'; //the bearer_auth to the EHMA wit

var think = function(data, callback) {
    var self = this;
    call_api('message','?q=' + encodeURIComponent(data), callback);

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
    var self = this;
    self.call_api(corpus,null,callback);
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

var call_api = function(endpoint, data, callback) {
    //var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/' + endpoint + data, //?q=' + encodeURIComponent(data),
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
}

module.exports.think = think;
module.exports.list_expressions = list_expressions;
