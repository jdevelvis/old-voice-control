var https = require('https');
var Future = require('futures').future;

var think = function(user_text, bearer_auth) {
    var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/message?q=' + encodeURIComponent(user_text),
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
            future.fulfill(undefined, JSON.parse(response));
        });
    }).on('error', function(e) {
        future.fulfill(e, undefined);
    }).end();

    return future;
}

var list_expressions = function(bearer_auth) {
    var future = Future.create();
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
            future.fulfill(undefined, response);
        });
    }).on('error', function(e) {
        future.fulfill(e, undefined);
    }).end();

    return future;
}

module.exports.think = think;
module.exports.list_expressions = list_expressions;
