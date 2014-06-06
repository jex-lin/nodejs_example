var WebSocketServer = require('websocket').server,
    http            = require('http'),
    sys             = require('sys'),
    path            = require('path'),
    fs              = require('fs');

// Create normal server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' HTTP server. URL' + request.url + ' requested.');

    var content = '',
        fileName = path.basename(request.url), //the file that was requested
        localFolder = __dirname + '/view/';

    if (fileName === 'index.html') {
        fullFileName = localFolder + fileName // setup the file name
        fs.readFile(fullFileName, function(err, content) {
            if (!err) {
                // Send the contents of index.html and the close the request
                response.end(content);
            } else {
                // Otherwise, let up inspect the error in the console
                console.dir(err)
            }
        });

    } else if (request.url === '/status') {
        response.writeHead(200, {'Content-Type': 'application/json'});
        var responseObject = {
            status: "ok"
        }
        response.end(JSON.stringify(responseObject));
    } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Sorry, unknown url');
    }
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            var responseObject = {
                status: "ok"
            }
            connection.sendUTF(JSON.stringify(responseObject));
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});

server.listen(9090, function() { });
sys.puts("Server Running on 9090");

