var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var async = require('async');
var sync = require('sync');
var EventEmitter = require('events').EventEmitter;
var dataReady = new EventEmitter();
var jf = require('jsonfile');
var songs = [];

var getPlaylist = function(){
	// songs = [];
	console.log("Obteniendo playlist");
	cmd = spawn('audtool', ['playlist-length']);
	cmd.stdout.on('data', function(data){
		var playlistLength = parseInt(data);
		console.log("size pl: "+ playlistLength);
		playlistLength;
		var i = 0;
		var tuple_data = 'audtool playlist-tuple-data';
		var d = {};
		async.whilst(function(){ return i < playlistLength;},
			function(callback){
				i++;
				//REFERENCIA e = error, so = sydout, se = stderr
				var cmd = exec(tuple_data+' file-path '+i, function(e, so, se){
					so = so.replace(/\n/, '').split('/');
					d.file_path = so[so.length -2];
					var cmd = exec(tuple_data+' title '+i, function(e, so, se){
						d.title = so.replace(/\n/, '') || "N/a";
						var cmd = exec(tuple_data+' album '+i, function(e, so, se){
							d.album = so.replace(/\n/, '') || d.file_path;
							var cmd = exec(tuple_data+' artist '+i, function(e, so, se){
								d.artist = so.replace(/\n/, '') || "N/a";
								//fn(d, i);
								//var c = i-=1;
								songs.push({
									song_id: i,
									title:d["title"], 
									artist: d['artist'], 
									album:d["album"],
									file_path:d["file_path"]
								});
								callback();
							});
						});
					});
				});
			},
			function(err){
				saveJson();
			}	
		);
	});
}

getPlaylist();

function saveJson(){
	var file = __dirname+'/public/'+songs[0].file_path.toLowerCase()+'-tuple-data.json';
	jf.writeFile(file, songs, function(err){
		if(err){
			console.log("Error guardando JSON");
			return;
		}else{
			console.log("JSON guardado con exito");
		}
	})
}