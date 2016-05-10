"use strict";

global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
}

var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
//var routes = require("./routes/index");
var expressLess = require("express-less");


var mongoose = require('mongoose');

var app = express();
var http = require('http').Server(app);
var socket = require('socket.io').listen(http);
//var request = require('request');
var socketVar;

socket.on('connection', function (sckt) {
    console.log('socket connected!');
    process.env.socketid = sckt.id;
});

var config = require('./bin/config');     //calling configuration file

var MongoDBPath = (process.env.NODE_ENV === 'production') ? process.env.MONGOLAB_URI : config.database;

mongoose.connect(MongoDBPath, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, "public")));
app.use(session({
    secret: "mofuckinrichmond",
    resave: false,
    saveUninitialized: true
}));

app.use("/stylesheets", expressLess(__dirname + "/app/less"));

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:30000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

require("./routes/index")(app, socket);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});

var appVar = {
    app: app,
    http: http
}

module.exports = appVar;