var fs = require('fs');
var WebSocketServer = require('ws').Server;

var _ws = null;
require('http').createServer(function (req, rsp) {
    if (req.url.indexOf('/log/') === 0) {
        if (_ws) {
            console.log('send', req.url);
            _ws.send(req.url);
        } 
        rsp.writeHead(200, {'Content-type': 'text/json'});
        rsp.end('{code: 0}');
    } else {
        rsp.writeHead(200, {
            'Content-type': 'text/html'
        });
        fs.createReadStream('index.html').pipe(rsp);
    }
}).listen(9876);

wss = new WebSocketServer({port: 9875});
wss.on('connection', function (ws) {
    _ws = ws;
    ws.on('close', function () {
        _ws = null;
    });
});

