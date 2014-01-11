var express = require('express')
, app = express()
, fs = require('fs')
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
, spawn = require('child_process').spawn
, path = require('path')
, log = require('winston');

var PORT = 80;

io.set('log level', 2); // info: 2, debug: 3

app.use('/', express.static(__dirname + "/static"));

server.listen(PORT);
log.info("Server listening on " + PORT);

CODE_DIR = '/tmp';

io.sockets.on('connection', function (socket) {
	socket.emit('connected', 'YAY!');
	socket.on('code', function(data) {
		var code = data["code"];
		var compiler = spawn('./run_docked_gdb.sh');
        log.info("GDB Docker container started (PID: " + compiler.pid + ")");
		socket.on('disconnect', function() {
            log.info("Socket disconnected. Killing process Docker container (PID: " + compiler.pid + ")");
            compiler.kill()
		});
        compiler.on('close', function(code, signal) {
            log.info("Process terminated. Code: " + code + " Signal: " + signal + " (PID: " + compiler.pid + ")");
        });
		compiler.stdout.setEncoding('utf8');
		compiler.stderr.setEncoding('utf8');
		var compiler_output = "";
		compiler.stdout.on('data', function(data) {
			log.debug("compiler.stdout: " + data);
			compiler_output += data;
			if(data.trim() == "NOW_IN_GDB") {
                log.info("Code successfully compiled (PID: " + compiler.pid + ")");
				socket.emit('compiled', "Successful");
				compiler.stdout.on('data', function(data) {
					log.debug("compiler.stdout: " + data);
					var lines = data.replace(/\n/g, "\n||").split("||")
					for(var i = 0; i < lines.length; i++) {
						if(lines[i].length != 0) {
							socket.emit("stdout", lines[i]);
						}
					}
				});
				compiler.stderr.on('data', function(data) {
                    log.warn("compiler.stderr: " + data);
					socket.emit('stderr', data);
				});
				socket.on('stdin', function(data) {
					log.debug("socket.stdin: " + data)
					compiler.stdin.write(data);
				});
			}
		});
		compiler.stderr.on('data', function(data) {
			log.warn("compiler.stderr: " + data);
			compiler_output += data;
		});
        log.info("Sending code to Docker container (PID: " + compiler.pid + ")");
		compiler.stdin.write(code);
		compiler.stdin.write("END_OF_ARDUINO_FILE\n");
	});
});
