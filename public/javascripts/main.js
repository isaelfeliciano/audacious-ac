$(document).on("ready", function(){	
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
});