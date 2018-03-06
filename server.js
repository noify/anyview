var http = require('http');
var url = require('url');
var util = require('util');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;

http.createServer(function (request, response) {
    var _url = url.parse(request.url, true)

    switch(_url.pathname){
      case '/': index(request, response)
        break;
      case '/getfiles': getfiles(request, response, _url)
        break;
      default: ;
    }
}).listen(8888);

function index (request, response) {
  response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
  fs.readFile(__dirname + '/index.html',function (err, data){
    response.end(data);
  });
}

function getfiles (request, response, _url) {
  var path = _url.query.path
  response.writeHead(200, {"Content-Type": "text/javascript;charset=utf-8"});
  if(typeof path === 'undefined' || path.length == 0){
    showLetter(list => {
      response.end(JSON.stringify(list));
    })
  } else {
    fileDisplay(_url.query.path, list => {
      response.end(JSON.stringify(list));
    })
  }
}
console.log('Server running at http://127.0.0.1:8888/');

/** 
 * 文件遍历方法 
 * @param filePath 需要遍历的文件路径 
 */  
function fileDisplay(filePath, callback) {
  filePath = path.resolve(filePath)
  fs.stat(filePath, function(eror,stats){  
    if(eror){  
      callback({code: 500, text: '获取文件stats失败'});  
    }else{  
        var isFile = stats.isFile();//是文件  
        var isDir = stats.isDirectory();//是文件夹  
        if(isFile){  
          callback(filedir) 
        }  
        if(isDir){
          //根据文件路径读取文件，返回文件列表  
          fs.readdir(filePath, (err, files) => {
            var list = []
            files.forEach(function(filename){ 
              list.push(path.join(filePath,filename));  
            });
            callback(list)
          }); 
        }  
    }  
  })
}

function showLetter(callback) {
  var wmicResult;
  var command = exec('wmic logicaldisk get caption', function(err, stdout, stderr) {
      if(err || stderr) {
          console.log("root path open failed" + err + stderr);
          return;
      }
      wmicResult = stdout;
  });
  command.stdin.end();   // stop the input pipe, in order to run in windows xp
  command.on('close', function(code) {
      var list = wmicResult.replace(/\s+/g, "").replace(/\r/g, "").replace(/Caption/g, "").split(':')
      list.pop();
      callback(list);
  });
}