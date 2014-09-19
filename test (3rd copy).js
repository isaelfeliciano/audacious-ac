var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var async = require('async');
var sync = require('sync');
/*var o = {};
o.songs = new Array();*/

var getPlaylist = function(){
	var o = {};
	o.songs = new Array();
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
		globalObj.songs = new Array(10);
		var count = 0;
		async.whilst(function(){ return count < 5;},
			function(callback){
				count++
				console.log('top: '+count);
				var d = {};
				cmd1 = spawn('audtool', ['playlist-tuple-data', 'title', count])
				cmd1.stdout.on('data', function(data){
					console.log('med: '+count);
					d.title = data.toString();
					cmd2 = spawn('audtool', ['playlist-tuple-data', 'album', count])
					cmd2.stdout.on('data', function(data){
						d.album = data.toString();
						cmd3 = spawn('audtool', ['playlist-tuple-data', 'artist', count])
						cmd3.stdout.on('data', function(data){
							d.artist = data.toString();
							console.log(d);
						});
						cmd3.stderr.on('data', function(data){
							console.log('cmd3: '+data.toString());
						});
					});
					cmd2.stderr.on('data', function(data){
						console.log('cmd2: '+data.toString());
					});
				});
				cmd1.stderr.on('data', function(data){
					console.log('cmd1: '+data.toString());
				});
				cmd1.on('close', function(code){
					console.log('error: '+code);
				})
				setTimeout(callback, 500);
			},
			function(err, d){
				console.log("All complete: "+d);
			}	
		);
	});
}

getPlaylist();

/*function getSongData(counter){
	var i = counter;
	var data = {};
	var q = async.queue(function(task, callback){
		console.log('task: '+ task.name);
		callback(i, data);
	}, 1);

	q.drain = function(){
		console.log(o.songs);
	}

	q.push({name: "title"}, function(i, data){
		cmd = exec('audtool playlist-tuple-data title '+i, function(err, stdout, stderr){
			data = {title: stdout};
			o.songs[i] = data;
		});
	});

	q.push({name: "album"}, function(i, data){
		cmd = exec('audtool playlist-tuple-data album '+i, function(err, stdout, stderr){
			data = {album: stdout};
			o.songs[i] = data;
		});
	});

	q.push({name: "artist"}, function(i, data){
		cmd = exec('audtool playlist-tuple-data artist '+i, function(err, stdout, stderr){
			data = {artist: stdout};
			o.songs[i] = data;
		});
	});
}*/