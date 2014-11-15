//Load modules
var ehma = require('./brain.js');
var express = require('express');

//----------------
//Main program
//----------------

//Initialize ehma
ehma.init();

//----------------
//Web Server
//----------------

var app = express();

app.use(express.static(__dirname + '/web'));

app.listen(3333);
