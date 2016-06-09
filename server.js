#!/usr/local/bin/node

var http = require('http')
var httpProxy = require('http-proxy')

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " <proxy-target>");
    process.exit(-1);
}

var address = process.argv[2];
var port = 8080;

var proxy = httpProxy.createProxyServer({});
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. ' + err);
});

var server = http.createServer(function(req, res) {
  console.log(req.method + " " + address + req.url);
  proxy.web(req, res, { target: address, timeout:2000 });
});

console.log('listening on port %s...', port);
server.listen(port);
