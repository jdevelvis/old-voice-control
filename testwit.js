var wit = require('./wit');

    wit.think('ehma turn on the lights',thought);

    function thought(err, response) {
        if (err) console.log(err); // handle error here
        console.log(JSON.stringify(response));
    }

    wit.list_expressions(list); 

    function list(err, response) {
        console.log(response);
    }
