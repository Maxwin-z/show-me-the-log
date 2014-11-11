var fs = require('fs');
var WebSocketServer = require('ws').Server;

var usedPorts = {9875: true, 9876: true};

var _ws = null;
require('http').createServer(function (req, rsp) { 
    console.log(req.url);
    if (req.url.indexOf('/log/') === 0) {
        var matches = req.url.match(/^\/log\/(\d+)\/(.+)/);
        if (matches) {
            var port = matches[1];
            var log = matches[2];
            var ws = usedPorts[port];

            if (ws) {
                try {
                    ws.send(log);
                    endRsp(rsp, {code: 0});
                } catch (e) {
                    console.log('invalid ws for port:', port);
                    delete usedPorts[port];
                }
            }
        }
        endRsp(rsp, {code: 1, message: 'invalid log url. use /log/[port]/[log] plz'});
    } else if (req.url.indexOf('/setport/') === 0) {
        var port = req.url.substring(9);
        if (usedPorts[port]) {
            endRsp(rsp, {code: 1, message: 'port[' + port + '] in using'});
        } else {
            startWSWithPort(port);
            endRsp(rsp, {code: 0});
        }
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
    ws.on('message', function (evt) {
        console.log('get', evt.data);
    });
});

function endRsp(rsp, json) {
    rsp.writeHead(200, {'Content-type': 'text/json'});
    rsp.end(JSON.stringify(json));
}

function startWSWithPort(port) {
    console.log('create ws with port:', port);
    var wss = new WebSocketServer({port: port});
    usedPorts[port] = true;
    wss.on('connection', function (ws) {
        console.log('port[' + port + '] connected');
        usedPorts[port] = ws;
        ws.on('close', function () {
            console.log('unregister port:', port);
            delete usedPorts[port];
        });
    });
}

