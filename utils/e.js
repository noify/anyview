var exec = require('child_process').exec;
showLetter(e => console.log(e))
// show  Windows letter, to compatible Windows xp

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
        console.log("wmic close:: code:" + code);
        var list = wmicResult.split('\n')
        list.shift();
        callback(list);
    });
}