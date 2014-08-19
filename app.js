var express = require('express');
var app = express();

var fs = require('fs');
var net = require('net');
var shelljs = require('shelljs');
app.use(express.urlencoded()); 

process.chdir(__dirname);

URIFILE="/mnt/pdp-main/uri"
uri = getURI();

function getURI() {
  if(fs.existsSync(URIFILE)) {
    return fs.readFileSync(URIFILE, {encoding: 'utf8'});
  }
  return "http://localhost:1337";
}

function saveURI() {
  return fs.writeFileSync(URIFILE, uri);
}

function getuzblsocket() {
    cmd = "netstat -ln | grep uzbl_socket | awk -F' ' '{print $9}'";
    socket = shelljs.exec(cmd).output.trim();
    if(socket) {
        return socket;
    }
    return false;
}

function uzblwrite(cmd) {
  try {
    var s = getuzblsocket();
    if(s){
      var conn = net.createConnection(s);
      conn.on('connect', function() {
          conn.write(cmd+"\r\n");
          conn.end();
      });
    }
  }
  catch(e) {
    return false;
    //return false;
  }
  return true;
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
  if(uzblwrite("uri "+req.body.uri)){
    uri = req.body.uri;
    saveURI();
  }
  res.send(uri);
});

var server = app.listen(1337, function() {
    console.log('Listening on port %d', server.address().port);
});

process.on('uncaughtException', function (err) {
      console.log(err);
}); 
