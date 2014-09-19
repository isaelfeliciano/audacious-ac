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
				var data = {};
				var q = async.queue(function(task, callback_2){
					//console.log('task: '+ task.name);
					callback_2(count, data);
				});

				q.drain = function(){
					console.log(o.songs);
					callback();
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
			},
			function(err){
				console.log("All complete: "+o.songs);
			}	
		);
	});
}

getPlaylist();

function getSongData(counter){
	var i = counter;
	var data = {};
	var q = async.queue(function(task, callback){
		//console.log('task: '+ task.name);
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
}