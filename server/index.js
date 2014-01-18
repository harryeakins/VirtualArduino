var express = require('express')
, app = express()
, fs = require('fs')
, server = require('http').createServer(app)
, io = require('socket.io').listen(server)
, spawn = require('child_process').spawn
, path = require('path')
, log = require('winston')
, Datastore = require('nedb')
, db = new Datastore()
, randomstring = require('randomstring');

var PORT = 8080;

io.set('log level', 2); // info: 2, debug: 3

app.use(express.json());
app.use('/', express.static(__dirname + "/static"));
app.use('/code/123', function(req, res) {
    res.send('Your code id was: 123');
});
app.get('/code/:id', function(req, res) {
    db.findOne({id: req.params.id}, function(err, doc) {
        log.info("inside db.findOne " + JSON.stringify(err) + JSON.stringify(doc));
        if(err) {
            log.info("User requested none existant code (ID: " + id + ")");
            res.send(404,"File not found");
        }
        res.send(doc);
    });
});
app.post('/code', function(req, res) {
    var id = randomstring.generate(7);
    var code = req.body.code;
    log.info("Code is " + code);
    db.insert({id: id, code: code}, function(err, doc) {
        if(err) {
            log.warn("DB insert failed! (ID: " + id + ")");
            res.send(501, "Server error");
            return;
        }
        log.info("Stored code into database with id " + id);
        res.status(201);
        res.setHeader('Location', '/code/' + id);   
        res.send();
    });
});
app.put('/code/:id', function(req, res) {
    var id = req.params.id;
    var code = req.body.code;
    log.info("Code is " + code);
    log.info("PUT request (ID: " + id + ")");
    db.update({id: id}, { id: id, code: code }, {}, function(err, numUpdates) {
        if(err || numUpdates == 0) {
            log.warn("Could not find document... (ID: " + id + ")");
            res.send(404, "Could not find document to update");
        } else {
            log.info("Successfully updated (ID: " + id + ")");
            res.status(200);
            res.send();
        }
    });
});

server.listen(PORT);
log.info("Server listening on " + PORT);

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
                    if(data.trim() != "") {
                        socket.emit('error', data);
                    }
				});
				socket.on('stdin', function(data) {
					log.debug("socket.stdin: " + data)
					compiler.stdin.write(data);
				});
			}
		});
		compiler.stderr.on('data', function(data) {
			log.warn("compiler.stderr: " + data);
            if(data.trim() != "") {
                socket.emit('error', data);
            }
			compiler_output += data;
		});
        log.info("Sending code to Docker container (PID: " + compiler.pid + ")");
		compiler.stdin.write(code);
		compiler.stdin.write("END_OF_ARDUINO_FILE\n");
	});
});
