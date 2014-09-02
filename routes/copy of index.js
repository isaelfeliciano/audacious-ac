var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var nconf = require('nconf');
var jf = require('jsonfile');
var util = require('util');
var resp = '';




/* GET home page. */
router.get('/', function(req, res) {
	res.send(200);
	var io = req.io;
	var cmd;
	//console.log(req.io);
	console.log("router ejectado");

	io.on('connection', function(socket){
	    socket.emit('connected');
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


			// cmd.on('exit', function(code){
			// 	resp = code;
			// });

			
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

		var execCmd_2 = function(cmdToExecNew, counter, callback){
			rs = [];
			var stream = fs.createWriteStream('routessong.json');
			var songArray = [];
			var o = {};

			cmd = exec('audtool ' + cmdToExecNew +' '+counter, function(error, stdout, stderr){
				//console.log(counter +': ' + stdout);
				o += {song: stdout};
				
				// var file = 'public/my-config.json';
				// jf.writeFileSync(file, o);


				return callback({id: counter, title: stdout.toString()});
			    if (error !== null) {
			      console.log('exec error: ' + error);
			    }
			});
			
		};

    	socket.on('getPlaylist', function(){
			console.log("Obteniendo playlist");
			var playlistLength = 0;
			cmdToExec = 'playlist-length';
			cmd = spawn('audtool', [cmdToExec]);
			cmd.stdout.on('data', function(data){
				playlistLength = parseInt(data);
				console.log("size pl: "+ playlistLength);
				var songsArray = [];
				var obj = {};
				obj.songs = [];
				for(var i = 1; i <= 10; i++){
				execCmd_2('playlist-song', i, function(data){
					//console.log(data.toString());
					obj.songs.push({id: data.id, title: data.title});
					console.log(obj.songs);
					return obj;
					// var file = 'public/my-config.json';
					// jf.writeFileSync(file, obj);
				});
			}console.log(obj);
				//console.log(songsArray);
			});
				
		});

	});

	
	//res.render('index', { resp: resp.toString() });
});

module.exports = router;
