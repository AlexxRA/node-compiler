var Sync = require('sync');
var fs = require('fs');
var cp = require('child_process');
const execSync = require('child_process').execSync;
var targetSource;
var targetExe;
var targetInput;
var fileName;

process.on('message', (message) => {
    // Process data
    Sync(function(){
        fileName = 'script' + message.id + '_' + new Date().getTime().toString();
        targetSource = __dirname+'/scripts/codeFiles/'+fileName+'.cpp';
        targetExe = __dirname+'/scripts/exe/'+fileName;
        targetInput = __dirname+'/scripts/inputs/' + fileName + '.txt';

        try {
            fs.writeFile(targetSource, message.script, function(err) {
                fs.writeFile(targetInput, message.inputs, function(err) {
                    Sync(function () {
                        var compilationResult = execSync(`g++ ${targetSource} -o  ${targetExe}`);
                        if (compilationResult.code == 1) { //error
                            process.send({error: compilationResult.stdout, success:false, id:message.id});
                        } else  { //success 
                            Sync(function() {
                                var start = new Date().getTime();
                                var executionResult = execSync("cd "+__dirname+"/scripts/exe; ./" + fileName + " < " + targetInput).toString();
                                if (executionResult.code == 1) { //error
                                    process.send({error: executionResult.stdout, success:false, id:message.id});        
                                } else  { //success
                                    var end = new Date().getTime();
                                    var time = end - start;
                                    process.send({result: executionResult, timeExec: time, success:true, id:message.id});
                                }
                            });
                        }
                    });
                });
            });        
        } catch (error) {
            process.send({error: error, success:false, id:message.id});
        }

        
    });
});