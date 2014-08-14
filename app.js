var express = require('express');
var app = express();

var net = require('net');
var shelljs = require('shelljs');
app.use(express.urlencoded()); 

uri = "http://localhost:1337"

function getuzblsocket() {
    cmd = "netstat -ln | grep uzbl_socket | awk -F' ' '{print $9}'";
    socket = shelljs.exec(cmd).output;
    if(socket) {
        return socket;
    }
    return false;
}

function uzblwrite(cmd) {
	var conn = net.createConnection(getuzblsocket());
	conn.on('connect', function() {
	    console.log('connected to unix socket server');
	    conn.write(cmd+"\r\n");
	    conn.end();
	});
}

app.get('/', function(req,res){
    res.sendfile('index.html');
});

app.get('/ip', function(req,res){
    res.send(shelljs.exec("ip addr | grep 'inet ' | awk '{print $2}'").output);
});

app.get('/nyan.gif', function(req,res){
    res.sendfile('nyan.gif');
});

app.get('/uri', function(req,res){  
    res.send(uri);
});

app.post('/uri', function(req, res){
  uzblwrite("uri "+req.body.uri);
  uri = req.body.uri;
  res.send(uri);
});

var server = app.listen(1337, function() {
    console.log('Listening on port %d', server.address().port);
});
