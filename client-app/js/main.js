$(document).on("ready", function(){	
	$.ajax({
		type: 'GET',
		url: 'http://10.0.0.219:3000',
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

	$('#footer').on('click', '#btn-backward', function(){
		socket.emit('command', {cmd: 'playlist-reverse'});
	});
	$('#footer').on('click', '#btn-play', function(){
		socket.emit('command', {cmd: 'playback-play'});
	});
	$('#footer').on('click', '#btn-forward', function(){
		socket.emit('command', {cmd: 'playlist-advance'});
	});

	$('#btn-playlist').on('click', function(){
		populateList();
	});

	var populateList = function(){
		socket.emit('getPlaylist');
		socket.on('cmd-res', function(data){

		});
	}
}	

});