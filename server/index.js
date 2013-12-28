var express = require('express')
, app = express()
, fs = require('fs')
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
, spawn = require('child_process').spawn
, path = require('path');

var PORT = 28888;


app.use('/', express.static(__dirname + "/static"));

server.listen(PORT);
console.log("Server listening on " + PORT);

CODE_DIR = '/tmp';

io.sockets.on('connection', function (socket) {
	socket.emit('connected', 'YAY!');
	socket.on('code', function(data) {
		var code = data["code"];
		var compiler = spawn('./run_docked_gdb.sh');
		socket.on('disconnect', function() {
			if(compiler.connected) compiler.kill()
		});
		compiler.stdout.setEncoding('utf8');
		compiler.stderr.setEncoding('utf8');
		var compiler_output = "";
		compiler.stdout.on('data', function(data) {
			console.log("stdout: " + data);
			compiler_output += data;
			if(data.trim() == "NOW_IN_GDB") {
				socket.emit('compiled', "Successful");
				compiler.stdout.on('data', function(data) {
					console.log("Received: " + data);
					var lines = data.replace(/\n/g, "\n||").split("||")
					for(var i = 0; i < lines.length; i++) {
						if(lines[i].length != 0) {
							socket.emit("stdout", lines[i]);
						}
					}
				});
				compiler.stderr.on('data', function(data) {
					socket.emit('stderr', data);
				});
				socket.on('stdin', function(data) {
					console.log("Received stdin: " + data)
					compiler.stdin.write(data);
				});
			}
		});
		compiler.stderr.on('data', function(data) {
			console.log("stderr: " + data);
			compiler_output += data;
		});
		compiler.stdin.write(code);
		compiler.stdin.write("END_OF_ARDUINO_FILE\n");
	});
});
