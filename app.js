var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var jf = require('jsonfile');
var async = require('async');

var routes = require('./routes/index');
var playlist = require('./routes/playlist');

var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    req.io = io;
    req.app = app;
    next();
});

app.use('/', routes);
//app.use('/playlist', routes);
app.use('/playlist', playlist);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

    io.on('connection', function(socket){
        socket.emit('conectado');
        console.log('Conectado');

        socket.on("command", function(data){
            console.log(data.cmd);
            var cmdToExec = data.cmd;
            cmd = spawn('audtool', [cmdToExec]);

            cmd.stdout.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("cmd-res", {cmdRes: resp.toString()});
            });

            cmd.stderr.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("cmd-err", {cmdRes: resp.toString()});
            });

            /*cmd.on('exit', function(code, signal){
                console.log();
            });*/

            
        });

        socket.on("playback-status", function(data){
            console.log(data.cmd);
            var cmdToExec = data.cmd;
            cmd = spawn('audtool', [cmdToExec]);

            cmd.stdout.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("playback-status-res", {cmdRes: resp.toString()});
            });

            cmd.stderr.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("playback-status-err", {cmdRes: resp.toString()});
            });

            /*cmd.on('exit', function(code, signal){
                console.log();
            });*/

            
        });

        socket.on("playlist-repeat-status", function(data){
            console.log(data.cmd);
            var cmdToExec = data.cmd;
            cmd = spawn('audtool', [cmdToExec]);

            cmd.stdout.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("playlist-repeat-status-res", {cmdRes: resp.toString()});
            });

            cmd.stderr.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                socket.emit("playlist-repeat-status-err", {cmdRes: resp.toString()});
            });

            /*cmd.on('exit', function(code, signal){
                console.log();
            });*/

            
        });

        socket.on("setvolume", function(data){
            console.log(data.cmd);
            var cmdToExec = data.cmd;
            cmd = spawn('audtool', ['set-volume', cmdToExec]);

            cmd.stdout.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                //socket.emit("playlist-repeat-status-res", {cmdRes: resp.toString()});
            });

            cmd.stderr.on('data', function(data){
                resp = data;
                console.log(resp.toString());
                //socket.emit("playlist-repeat-status-err", {cmdRes: resp.toString()});
            });

            /*cmd.on('exit', function(code, signal){
                console.log();
            });*/

            
        });


        socket.on("disconnect", function(){
            console.log("socket: me he desconectado");
            //socket.disconnect();
        });

        socket.on("hola", function(){
            console.log('hola recibido');
        });

        socket.on("desconectar", function(data){
            console.log("socket desconectado");
            socket.emit("socket desconectado");
            socket.disconnect();
        });

        

        var execCmd = function(cmdToExecNew, callback){
            rs = '';
            cmd = spawn('audtool', cmdToExecNew);
            cmd.stdout.on('data', function(data){
                rs += data.toString();
            });

            cmd.stderr.on("data", function(data){
                console.log("Ha surgido un error "+ data);
            });

            cmd.stdout.on('close', function(code){
                return callback(rs);
            });
        };


        
    });
    

module.exports = app;
