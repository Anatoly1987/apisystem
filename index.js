#!/usr/bin/env node


var express = require('express');
var checkout = require('./route/checkout');
var support = require('./route/support');
var customer = require('./route/customer');
var business = require('./route/business');
var admin = require('./route/admin');
var helper = require('./route/helper');
var callback = require('./route/callback');

var Timing_functions = require('./utils/timing_functions');

var socketio = require('socket.io');
var checkoutsocket_process = require('./server/checkoutsocket');
var supportsocket_process = require('./server/supportsocket');
var global_area = require('./config/global');

var mongoose = require("mongoose");
var config=require("./config/config");
var bodyParser = require("body-parser");

var path = require('path');   

mongoose.connect(config.mongodb_uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log("mongodb is connected to apidb");
})


var app=express();
//Set static files for js file..
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));
//Set view engine
app.set('view engine', 'ejs');


app.use(bodyParser.json());  //support json encoded bodies
app.use(bodyParser.urlencoded({extended:true}));  //support encoded bodies


//For the url starts with report
app.use('/checkout', checkout);
app.use('/support', support);
app.use('/customer', customer);
app.use('/business', business);
app.use('/admin', admin);
app.use('/helper', helper);
app.use('/callback', callback);

var server = app.listen(8090, function(){
        var host = server.address().address;
        var port = server.address().port;
        console.log("server started ", host, ":", port);
});

//For the socketio server
var socket_con = socketio(server);

//For the connected socket process
checkoutsocket_process(socket_con);
supportsocket_process(socket_con);

setInterval(Timing_functions.send_email_reserved, 60000);  //6000000