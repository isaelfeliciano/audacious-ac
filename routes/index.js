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
				}else{
					console.log("Archivo guardado con exito");
				}
			});

			jf.readFile('public/my-config.json', function(err, result){
				if (err){console.log("Error leyendo el archivo: "+err);}
				if (result !== null){
					if (result.songs.length >= playlistObj.large){
						playlistEvents.emit('finish');
						//console.log("Finish "+ playlistObj.large);
					}
				}
			});	
		}

		var cmdExecLogic = function(counter, globalObj, error, stdout, stderr){
			var str = stdout.toString();
			var strSplit = str.split(/\s*-\s*/ig);
			//console.log(strSplit);

			switch(strSplit.length){
				case 1:
					var data = {
						song_id: counter || "Vacio", 
						title: stdout.toString().replace(/\n/, "") || "Vacio",
						artist: "N/a",
						album: "N/a",
						song_title: "N/a"
					};
					break;
				case 2:
					var data = {
						song_id: counter || "Vacio", 
						title: stdout.toString().replace(/\n/, "") || "Vacio",
						artist: strSplit[0],
						album: "N/A",
						song_title: strSplit[1].replace(/\n/, "")
					};
					break;
				case 3:
					var data = {
						song_id: counter || "Vacio", 
						title: stdout.toString().replace(/\n/, "") || "Vacio",
						artist: strSplit[0],
						album: strSplit[1],
						song_title: strSplit[2].replace(/\n/, "")
					};
					break;
				default:
					var data = {
						song_id: counter || "Vacio", 
						title: stdout.toString().replace(/\n/, "") || "Vacio",
						artist: "N/a",
						album: "N/a",
						song_title: "N/a"
					};
			}

			counter--;
			globalObj.songs[counter] = data;
			updateJson(globalObj);

			return globalObj;
		}

		var execCmd_2 = function(cmdToExecNew, counter, globalObj){
			counter++;
			var q = async.queue(function(task, callback){
				callback();
			}, 2);

			q.drain = function(){
				console.log("Playlist obtenida con exito");
			}

			q.push({name: "cmd"}, function(){
				cmd = exec('audtool ' + cmdToExecNew +' '+counter, cmdExecLogic.bind(null, counter, globalObj));
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
				var globalObj = {};
				playlistLength--;
				playlistObj.large = playlistLength;
				globalObj.songs = new Array(10);
				for(var i = 0; i <= playlistLength; i++){
					(function(i, globalObj){
						var j = i;
						setTimeout(function(){
							execCmd_2('playlist-song', j, globalObj);
						}, 0);
					})(i, globalObj);
				}
			});

			playlistEvents.once('finish', function(){
				console.log("Lista cargada por completo");
			})
		});
	});
	//res.render('index', { resp: resp.toString() });
});

module.exports = router;
