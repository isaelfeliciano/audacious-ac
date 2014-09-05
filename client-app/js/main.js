$(document).on("ready", function(){	
	var flag = 0;

	$.ajax({
		type: 'GET',
		url: 'http://localhost:3000',
		settings: {
			async: false
		}
	}).complete(function(res){
		console.log("Ajax get enviado");
		connectSocket();
	});

var connectSocket = function(){
	var socket = io.connect('http://10.0.0.219:3000');
	socket.on('connected', function(data){
		console.log("Socket connected");
		getJson();

		$('input[type="button"]').on('click', function(e){
			e.preventDefault();
			var cmd = $('input[name="my-input"]').val();
			socket.emit("command", {cmd: cmd});
		});
	});

	socket.on("cmd-res", function(data){
		$('p').html(data.cmdRes);
	});

	socket.on("cmd-err", function(data){
		$('p').html(data.cmdRes);
	});

	/*
		CONTROLES
	*/

	$('#btn-backward, #btn-backward-2').on('click', function(){
		socket.emit('command', {cmd: 'playlist-reverse'});
	});
	$('#btn-play, #btn-play-2').on("click", function(){
		switch(flag){
			case 0:
				socket.emit('command', {cmd: 'playback-play'});
				$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-play');
				$('#btn-play-icon, #btn-play-icon-2').addClass('fa-pause');
				flag = 1;
				break;
			case 1:
				socket.emit('command', {cmd: 'playback-pause'});
				$('#btn-play-icon, #btn-play-icon-2').removeClass('fa-pause');
				$('#btn-play-icon, #btn-play-icon-2').addClass('fa-play');
				flag = 0;
				break;
		}
	});

	$('#btn-forward, #btn-forward-2').on('click', function(){
		socket.emit('command', {cmd: 'playlist-advance'});
	});

	$('#btn-playlist').on('click', function(){
		if ($('#playlist').html() == ''){
			getJson();
		}
	});

	/*
		--CONTROLES
	*/

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


		/*$.ajax({
			type: 'GET',
			url: 'http://10.0.0.219:3000/playlist/playlist',
			dataType: 'JSON'
		}).done(function(data){
			console.log("data ha llegado");
		});*/

		/*var songs = localStorage.getItem('songs');
		setTimeout(function(){
			console.log(songs.songs[3].title);
		}, 1000);*/
			
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
}	

//Volume Slider
	var iValue = 50;
   // $("#lblVertical").text(iValue);
    //$("#lblHorizontal").text(iValue);
    $("#sliderVer").slider({
        min: 0,
        max: 100,
        orientation: "vertical",
        value: iValue,
        step: 5,
        slide: function(event, ui) {
            //$("#lblVertical").text(ui.value);
        }
    });


});