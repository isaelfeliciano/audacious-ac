var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var nconf = require('nconf');
var jf = require('jsonfile');
var util = require('util');
var resp = '';
var async = require('async');
var playlistObj = {};
var EventEmitter = require('events').EventEmitter;
var playlistEvents = new EventEmitter();
// var globalObj = {};
// globalObj.songs = [];




/* GET home page. */
router.get('/', function(req, res){
	res.setHeader('Access-Control-Allow-Origin','*');
	res.send(200);
	res.end();
	var io = req.io;
	var cmd;
	//console.log(req.io);
	console.log("router ejectado");

	io.on('connection1', function(socket){
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
	//res.render('index', { resp: resp.toString() });
});


module.exports = router;
