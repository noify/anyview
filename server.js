var http = require('http');
var url = require('url');
var util = require('util');
var fs=require("fs");

http.createServer(function (request, response) {
  
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile(__dirname + '/index.html',function (err, data){
      response.end(data);
    });
    // response.end(util.inspect(url.parse(request.url, true)));
}).listen(8888);

console.log('Server running at http://127.0.0.1:8888/');