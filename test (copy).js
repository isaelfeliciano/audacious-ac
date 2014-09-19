var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var async = require('async');
var o = {};
o.songs = new Array();

var getPlaylist = function(){
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
		for(var i = 0; i <= 9; i++){
			(function(i, globalObj){
				var j = i;
				setTimeout(function(){
					getSongData(j);
				}, 0);
			})(i, globalObj);
		}
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