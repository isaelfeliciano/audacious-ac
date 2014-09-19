$(document).on("ready", function(){	
	var flag = 0;
	var objSocket = {};
	var volumeValue = 50;

	if(localStorage.getItem('connect-conf')){
		var connect_conf = localStorage.getItem('connect-conf');
		connect_conf = JSON.parse(connect_conf);
		$('#server-ip').val(connect_conf.server_ip);
		$('#server-port').val(connect_conf.server_port);
		sendAjax(connect_conf);
	}else{
		window.location = '#connection-page';
	}

	$('#bt-connect').on('click', function(e){
		e.preventDefault();
		if($('#server-ip').val() === ''){
			alert('You most fill all fields');
		}else{
			var server_ip = $('#server-ip').val();
			var server_port = $('#server-port').val();
			var o = {
				"server_ip": server_ip,
				"server_port": server_port
			}
			localStorage.setItem('connect-conf', JSON.stringify(o));
			var connect_conf = localStorage.getItem('connect-conf');
			connect_conf = JSON.parse(connect_conf);
			sendAjax(connect_conf);
		}
	});

	function sendAjax(connect_conf){
		var url = connect_conf.server_ip+':'+connect_conf.server_port
		$.ajax({
			type: 'GET',
			url: 'http://'+url,
			settings: {
				async: false,
				error: function(jqXHR, textStatus, errorThrown){
					console.log('textStatus');
				}
			}
		}).done(function(res){
			console.log("Ajax get enviado");
			var options = {'reconnection':false};
			objSocket.socket = io.connect('http://'+url, options);
			objSocket.connectSocket();
		}).fail(function(){
			alert("Server not found!");
			window.location= '#connection-page';
		});
	}


objSocket.emitter = function(emit_this, data){
	var socket = this.socket;
	socket.emit(emit_this, {cmd: data});
}

objSocket.connectSocket = function(){
	var socket = this.socket;
	//if (socket.connected == false) {window.location = '#intro-page'};
	socket.on("conectado", function(data){
		console.log("check 2", socket.connected);
		console.log("Socket connected");
		audaciousStatus();
		/*activateControls();
		getJson();*/
	});

	socket.on('connect_error', function(){
		//alert("Error conectando con la aplicacion");
		window.location= '#connection-page';
	});

	socket.emit("playback-status", {cmd: "playback-status"});
	socket.on("playback-status-res", function(data){
		var str = data.cmdRes;
		if(str.substring(0,7) === "playing"){
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-play');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-pause');
			flag = 1;
			showCurrentSong();
		}else{
			$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-pause');
			$('#btn-play-icon, #btn-play-icon-2').addClass('fa-play');
			flag = 0;
		}
	});

	function showCurrentSong(){
		socket.emit('get-current-song', {cmd: 'playlist-position'});
		socket.on('get-current-song-res', function(data){
			var position = parseInt(data.cmdRes);
			var songs = JSON.parse(localStorage.getItem('songs'));
			position-= 1;
			var title = songs.songs[position].song_title;
			var artist = songs.songs[position].artist;
			var album = songs.songs[position].album;
			$('.song-title').html('<i class="fa fa-music"></i> ' +title);
			$('.song-artist').html('<i class="fa fa-user"></i> '+artist);
			$('.song-album').html('<i class="fa fa-dot-circle-o"></i> '+album);
		});
	}

	socket.emit('get-volume', {cmd: 'get-volume'});
	socket.on('get-volume-res', function(data){
		$("#sliderVer").slider({
			value: data.cmdRes
		});
	});
}


function audaciousStatus(){
	objSocket.socket.emit('audacious-status');
	objSocket.socket.on('audacious-encendido',function(){
		activateControls();
		getJson();
		window.location = '#main-page';
		//$.mobile.navigate('#main-page');
		objSocket.connectSocket();
	});

	objSocket.socket.on('audacious-apagado', function(){
		$.mobile.navigate('#intro-page');
		$('#intro-page a').on('click', function(){
			objSocket.socket.emit('encender');
		});
	});
}


function getJson(){
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
		var liContent = '<li id="'+val.song_id+'"><a href="#"><p><strong>'+title+'</strong></p><p>'+artist+'</p>';
		liContent+= '<p class="ui-li-aside">'+''+'</p></a></li>';
		$('#playlist').append(liContent);
		if(i == data.songs.length){
			$('#playlist').listview('refresh');
		}
	});
	//$('#playlist').listview('refresh');
}

//objSocket.connectSocket();


	/*
		CONTROLES
	*/
function activateControls(){
	$('#btn-backward, #btn-backward-2').on('click', function(){
		objSocket.socket.emit('command', {cmd: 'playlist-reverse'});
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

	$('#bt-random').on('click', function(){
		objSocket.socket.emit("command", {cmd: "playlist-shuffle-toggle"});
		console.log("bt-random presionado");
		toggleRandom();
	});

	var toggleRandom = function(){
		objSocket.socket.emit("playlist-random-status", {cmd: "playlist-shuffle-status"});
		objSocket.socket.on("playlist-random-status-res", function(data){
			var s = data.cmdRes;
			if (s.substring(0,2) === "on"){
				$('#bt-random').addClass('pure-button-active');
			}else{
				$('#bt-random').removeClass('pure-button-active');
			}
		});
	}
	toggleRandom();	

	$('#playlist').on('click', 'li', function(){
		objSocket.socket.emit('command', {cmd: ['playlist-jump', $(this).attr('id')]});
		objSocket.socket.emit('command', {cmd: 'playback-play'});
	});	
}

//VOLUME

var emitVolume = function(event, ui){
	objSocket.emitter('setvolume', ui.value);
}

$("#sliderVer").slider({
    min: 0,
    max: 100,
    orientation: "vertical",
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