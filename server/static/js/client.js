
$(document).ready(function() {
    var url = document.location.href;
    var editor = document.editor = CodeMirror.fromTextArea($("#code")[0], {
        mode: "text/x-arduino",
        matchBrackets: true,
    });
    editor.setSize(486)

    if(document.location.hash) {
        var doc = $.get('/code/' + document.location.hash.slice(1), function(data) {
            console.log("received " + JSON.stringify(data));   
            editor.setValue(data.code);
        });
    }

    function saveCode() {
        var code = editor.getValue();
        if(document.location.hash) {
            $.ajax({
                url: '/code/' + document.location.hash.slice(1),
                data: JSON.stringify({code: code}),
                type: 'PUT',
                contentType: 'application/json',
                success: function(data) {
                    alert("Successfully saved!");   
                },
                error: function(data) {
                    alert("Saving failed...");
                }
            });
        } else {
            $.ajax({
                url: '/code', 
                data: JSON.stringify({code: code}),  
                type: 'POST',
                contentType: 'application/json',
                success: function(data, textStatus, jqXHR) {
                    var location = jqXHR.getResponseHeader('Location');
                    id = location.split('code/')[1];
                    window.location.hash = id;
                    alert("Successfully saved!");
                },
                error: function(data) {
                    alert("Saving failed...");
                }
            });
        }
    }

    function getCode() {
        return '#include "Arduino.h"\n' + editor.getValue() + '\n#include "ArduinoAfter.h"\n';
    }

    function highlightLine(lineNum) {
        for(var i = 1; i <= editor.lineCount(); i++) {
            editor.removeLineClass(i, "background", "program_counter");
        }
        if(lineNum) {
            editor.addLineClass(lineNum, "background", "program_counter");
        }
    }

    $("#compile").click(function() {
        $("#overlay").addClass("currently-loading");
        if(io.sockets[url]){
            delete io.sockets[url];
            io.j = [];
        }
        console.log("Connecting with sockets.io to " + url);
        var socket = document.socket = io.connect(url);
        socket.on('connected', function (data) {
            console.log("Successfully connected");
            console.log(data);
            console.log("Sending code");
            socket.emit('code', { 
                code: getCode()
            });
            socket.on('compiled', function(data) {
                console.log("Code successfully compiled: " + data);
                socket.on('stdout', function(data) {
                    console.log("stdout: " + data);

                    if(data.match(/^\*stopped/)) {
                        $("#overlay").removeClass("currently-loading");
                        var frame_json = data.match(/frame=(.*),thread-id/)[1].replace(/=/g, "\":").replace(/,([a-zA-Z])/g, ",\"$1").replace(/{/g, "{\"");
                        var frame = JSON.parse(frame_json)
                        $(".program_counter").removeClass("program_counter");
                        if(frame.file.match(/prog\.c$/)) {
                            highlightLine(parseInt(frame.line)-2);
                            socket.emit("stdin",  "1337-data-evaluate-expression pinVoltages\n");
                        } else {
                            socket.emit("stdin", "-exec-continue\n");
                        }
                    }
                    if(data.match(/^1337/)) {
                        var led_state = JSON.parse("[" + data.match(/value="{([^}]+)}"/)[1] + "]");
                        for(var i = 13; i >= 10; i--) {
                            if(led_state[i] == 1) {
                                $("#pin" + i).show();
                            } else {
                                $("#pin" + i).hide();
                            }
                        }
                    }
                    if(data.match(/^%/)) {
                        var existingText = $("#console textarea").text();
                        $("#console textarea").text(existingText + data.slice(1));
                    }
                });
                socket.emit('stdin', 'set print repeats 0\n');
                socket.emit('stdin', '-break-insert setup\n');
                socket.emit('stdin', '-break-insert loop\n');
                socket.emit('stdin', '-exec-run\n');
            });
            socket.on('error', function(data) {
                if(data.match(/main\.c:[0-9]+:[0-9]+:/)) {
                    var error = data.match(/main\.c:[0-9]+:[0-9]+:(.*)/)[1];
                    alert(error);
                } else {
                    alert(data);
                }
            });
        });
    });
    $("#next").click(function() {
        var socket = document.socket;
        if(!socket) return;
        socket.emit('stdin', '-exec-next\n');
    });
    $("#save").click(function() {
        saveCode();
    });
});
