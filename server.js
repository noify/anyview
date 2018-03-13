var http = require('http');
var url = require('url');
var util = require('util');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;

var mime = {
  '.html': 'text/html,charset=utf-8',
  '.htm': 'text/html,charset=utf-8',
  '.js': 'text/javascript,charset=utf-8',
  '.css': 'text/css,charset=utf-8',
  '.gif': 'image/gif,charset=utf-8',
  '.jpg': 'image/jpeg,charset=utf-8',
  '.png': 'image/png,charset=utf-8',
  '.json': 'application/json,charset=utf-8',
  '.txt': 'text/plain,charset=utf-8',
  '.mp4': 'video/mpeg4,charset=utf-8',
  '.mp3': 'audio/mp3,charset=utf-8',
  '.svg': 'image/svg+xml',
  '': 'application/octet-stream',
}
http.createServer(function (req, res) {
    var _url = url.parse(req.url, true)
    var pathname = _url.pathname
    var path = _url.path
    switch(pathname){
      case '/': getfile(req, res, __dirname + '/index.html')
        break;
      case '/getfiles': getfiles(req, res, _url)
        break;
      case '/getfile': getfile(req, res, path)
        break;
      default: ;
    }
    if(~pathname.indexOf('/images')){
      getfile(req, res, __dirname + path)
    }
}).listen(8888);

function getfiles (req, res, _url) {
  var pathname = _url.query.path;
  if(typeof pathname === 'undefined' || pathname.length == 0){
    showLetter(list => {
      res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
      res.end(JSON.stringify(list));
    })
  } else {
    fileDisplay(req, res, pathname, list => {
      res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
      res.end(JSON.stringify(list));
    })
  }
}
function getfile (req, res, pathname) {
  fs.exists(pathname, function(exists){
    if(exists){
      _mime = mime[path.extname(pathname)]
      res.writeHead(200, {"Content-Type": typeof _mime === 'undefined' ? mime['.txt'] : _mime});
      fs.readFile(pathname, function (err, data){
          res.end(data);
      });
    } else {
        res.writeHead(404, {"Content-Type": "application/json;charset=utf-8"});
        res.end("{code:404,text:'未找到该文件'}");
    }
  });
}
console.log('Server running at http://127.0.0.1:8888/');

/** 
 * 文件遍历方法 
 * @param filePath 需要遍历的文件路径 
 */  
function fileDisplay(req, res, filePath, callback) {
  fs.stat(filePath, function(eror, stats){
    if(eror){
      callback({code: 500, text: '获取文件stats失败'});  
    }else{  
        var isFile = stats.isFile();//是文件  
        var isDir = stats.isDirectory();//是文件夹  
        if(isFile){
          getfile(req, res, filePath) 
        }
        if(isDir){
          //根据文件路径读取文件，返回文件列表  
          fs.readdir(filePath, (err, files) => {
            var list = []
            if(typeof files === 'undefined'){
              callback({code: 500, text: '获取文件夹失败'});
              return
            }
            files.forEach(function(filename){
              var pathname = path.join(filePath, filename)
              try{
                var extname = fs.statSync(pathname).isDirectory() ? 'dir' : path.extname(pathname).substring(1)
                list.push({
                  pathname: pathname,
                  filename: filename,
                  extname: extname
                }); 
              }catch(e){
                list.push({
                  pathname: pathname,
                  filename: filename,
                  extname: '*'
                }); 
              }
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
      list = list.map(e => {
        return {
          pathname: e + ':/',
          filename: e + '盘',
          extname: 'dir'
        }
      })
      callback(list);
  });
}