var WebSocketServer = require('websocket').server,
    RedisDB         = require("redis"),
    http            = require('http'),
    sys             = require('sys'),
    path            = require('path'),
    url             = require('url'),
    sendRequest     = require('request'),
    fs              = require('fs');

// Create normal server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' HTTP server. URL' + request.url + ' requested.');

    var content = '',
        fileName = path.basename(request.url), //the file that was requested
        localFolder = __dirname + '/view/',
        urlInfo = url.parse(request.url,true);


    if (urlInfo.pathname === '/index.html') {
        fullFileName = localFolder + fileName // setup the file name
        fs.readFile(fullFileName, function(err, content) {
            if (!err) {
                // Send the contents of index.html and the close the request
                response.end(content);
            } else {
                // Otherwise, let up inspect the error in the console
                console.dir(err);
            }
        });
    } else if (urlInfo.pathname === '/addDevice') {
        if (request.method == 'GET') {

            response.writeHead(200, {'Content-Type': 'application/json'});

            var responseObject = {
                status: 'fail'
            };

            // CURL get city by ip
            options = {
                uri:    "http://...?ip=" +urlInfo.query.ip,
                method: "GET",
            };
            sendRequest(options, function (error, res, body) {
                if (error) {
                    console.log('Error: ' + error);
                }
                body = JSON.parse(body);
                if (body.status === 0) {
                    var redis = RedisDB.createClient();
                    var value = {
                        did: urlInfo.query.did,
                        ip: urlInfo.query.ip,
                        city: body.content.address,
                        point: body.content.point
                    };
                    redis.set('point', value, function(error, result) {
                        if (error) {
                            console.log('Error: ' + error);
                            response.end(JSON.stringify(responseObject));
                        } else {
                            console.log('Save into redis : ' + JSON.stringify(value));
                            responseObject.status = 'ok';
                            response.end(JSON.stringify(responseObject));
                        }
                    });
                } else {
                    console.log('status fail');
                    response.end(JSON.stringify(responseObject));
                }
                console.log(body);
            });

            //redis.get('name', function (error, result) {
            //    if (error) console.log('Error: ' + error);
            //    else console.log('Name: ' + result);

            //});
        }
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
