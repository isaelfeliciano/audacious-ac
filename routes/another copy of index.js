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
// var globalObj = {};
// globalObj.songs = [];




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


		var updateJson = function(globalObj){
			var file = 'public/my-config.json';
				jf.writeFile(file, globalObj, function(err){
					if(err){
						console.log("Ha ocurrido un error escribiendo archivo: "+ err);
					}
				});
		}

		var cmdExecLogic = function(counter, globalObj, error, stdout, stderr){

			var datas = {id: counter || "Vacio", title: stdout.toString() || "Vacio"};
			counter -= 1;
			globalObj.songs[counter] = {id: datas.id, title: datas.title};
			//console.log("stdout "+ stdout.toString());
			console.log("counter: "+counter);
			console.log("length: " +globalObj.songs.length);
			console.log(globalObj.songs[counter].title);

			updateJson(globalObj);

			return globalObj;
		}

		var execCmd_2 = function(cmdToExecNew, counter, globalObj){
			rs = [];
			var stream = fs.createWriteStream('routessong.json');
			var songArray = [];
			var o = {};
			counter += 1;
			cmd = exec('audtool ' + cmdToExecNew +' '+counter, cmdExecLogic.bind(null, counter, globalObj));
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
				var globalObj = {};
				var loopTimes = playlistLength / 10;
				globalObj.songs = [{},{},{},{},{},{},{},{},{},{}];
				for(var i = 0; i <= playlistLength; i++){
					(function(i, globalObj){
						var j = i;
						setTimeout(function(){
							execCmd_2('playlist-song', j, globalObj);
						}, 0);
					})(i, globalObj);
				}
				//console.log(globalObj.songs[0].title);
				//console.log(songsArray);
			});
				
		});

	});

	
	//res.render('index', { resp: resp.toString() });
});

module.exports = router;
