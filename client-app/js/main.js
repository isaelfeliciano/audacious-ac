$(document).on("ready", function(){	
	var flag = 0;
	var objSocket = {};
	objSocket.to = 'http://10.0.0.219:3000';

	$.ajax({
		type: 'GET',
		url: 'http://localhost:3000',
		settings: {
			async: false
		}
	}).complete(function(res){
		console.log("Ajax get enviado");
		var options = {'force new connection':true};
		objSocket.socket = io.connect('http://10.0.0.219:3000', options);
		objSocket.connectSocket();
	});


objSocket.emitter = function(emit_this, data){
	var socket = this.socket;
	socket.emit(emit_this, {cmd: data});
}

objSocket.connectSocket = function(){
	var socket = this.socket;
	console.log("check 1", socket.connected);
	socket.on("conectado", function(data){
		console.log("check 2", socket.connected);
		console.log("Socket connected");
		activateControls();
		getJson();
	});


	var getJson = function(){
		// socket.emit('getPlaylist');
		// socket.on('cmd-res', function(data){

		// });

		if(!localStorage.getItem('songs')){
			$.getJSON('http://localhost:3000/playlist', function(data){
				console.log("data ha llegado");
				localStorage.setItem('songs', data);
				populateList(data);
			});
		}else{
			var data = localStorage.getItem('songs');
			populateList(data);
		}
	}

	var populateList = function(data){
		data = JSON.parse(data);
		$.each(data.songs, function(i, val){
			var song_title = val.song_title;
			var artist = val.artist;
			var title = (val.song_title == 'N/A') ? val.title : val.song_title;
			var liContent = '<li><a href="#"><p><strong>'+title+'</strong></p><p>'+artist+'</p>';
			liContent+= '<p class="ui-li-aside">'+'3:45'+'</p></a></li>';
			$('#playlist').append(liContent);
			if(i == data.songs.length){
				$('#playlist').listview('refresh');
			}
		});
		//$('#playlist').listview('refresh');
	}

	socket.emit("playback-status", {cmd: "playback-status"});
	socket.on("playback-status-res", function(data){
		var str = data.cmdRes;
		if(str.substring(0,7) === "playing"){
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-play');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-pause');
			flag = 1;
		}else{
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-pause');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-play');
			flag = 0;
		}
	});
}
//objSocket.connectSocket();


	/*
		CONTROLES
	*/
function activateControls(){
	$('#btn-backward, #btn-backward-2').on('click', function(){
		socket.emit('command', {cmd: 'playlist-reverse'});
	});
	$('#btn-play, #btn-play-2').on("click", function(){
		switch(flag){
			case 0:
			objSocket.socket.emit('command', {cmd: 'playback-playpause'});
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-play');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-pause');
			flag = 1;
			break;
			case 1:
			objSocket.socket.emit('command', {cmd: 'playback-playpause'});
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-pause');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-play');
			flag = 0;
			break;
		}
	});

	$('#btn-forward, #btn-forward-2').on('click', function(){
		objSocket.socket.emit('command', {cmd: 'playlist-advance'});
	});

	$('#btn-playlist').on('click', function(){
		if ($('#playlist').html() == ''){
			getJson();
		}
	});

	$('#bt-repeat').on('click', function(){
		objSocket.socket.emit("command", {cmd: "playlist-repeat-toggle"});
		console.log("bt-repeat presionado");
		toggleRepeat();
	});

	var toggleRepeat = function(){
		objSocket.socket.emit("playlist-repeat-status", {cmd: "playlist-repeat-status"});
		objSocket.socket.on("playlist-repeat-status-res", function(data){
			var s = data.cmdRes;
			if (s.substring(0,2) === "on"){
				$('#bt-repeat').addClass('pure-button-active');
			}else{
				$('#bt-repeat').removeClass('pure-button-active');
			}
		});
	}
	toggleRepeat();	
}

//VOLUME

var emitVolume = function(event, ui){
	objSocket.emitter('setvolume', ui.value);
}

var iValue = 50;
$("#sliderVer").slider({
    min: 0,
    max: 100,
    orientation: "vertical",
    value: iValue,
    step: 5,
    slide: function(event, ui) {
    	emitVolume(event, ui);
    }
});

////VOLUME

	/*
		--CONTROLES
	*/






});