const { exec } = require('child_process');
const fs = require('fs');

var targetSource;
var targetExe;
var targetInput;
var fileName;

process.on('message', (message) => {
    fileName = 'script' + message.id + '_' + new Date().getTime().toString();
    targetSource = __dirname+'/scripts/codeFiles/'+fileName+'.cpp';
    targetExe = __dirname+'/scripts/exe/'+fileName;
    targetInput = __dirname+'/scripts/inputs/' + fileName + '.txt';

    fs.writeFile(targetSource, message.script, (errorSource) => {
        if (errorSource){
            console.log(`errorSource: ${errorSource}`);
            process.send({error: errorSource, success:false, id:message.id});
            return;
        }
        console.log(`cpp created`);
        fs.writeFile(targetInput, message.inputs, (errorInput) => {
            if (errorInput){
                console.log(`errorInput: ${errorInput}`);
                process.send({error: errorInput, success:false, id:message.id});
                return;
            }
            console.log(`txt created`);
            exec(`g++ ${targetSource} -o ${targetExe}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    process.send({error: error.message, success:false, id:message.id});
                    return;
                }
            
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    process.send({error: stderr, success:false, id:message.id});
                    return;
                }
            
                console.log(`stdout: ${stdout}`);
            
                exec(`cd ${__dirname}/scripts/exe;  ./${fileName} < ${targetInput}`, (errorExe, stdoutExe, stderrExe) => {
                    if (errorExe) {
                        console.log(`errorExe: ${errorExe.message}`);
                        process.send({error: errorExe.message, success:false, id:message.id});
                        return;
                    }
                
                    if (stderrExe) {
                        console.log(`stderrExe: ${stderrExe}`);
                        process.send({error: stderrExe, success:false, id:message.id});
                        return;
                    }
                
                    //********exe result*********
                    console.log(`stdoutExe: ${stdoutExe}`);
                    process.send({result: stdoutExe, success:true, id:message.id});
                    //********exe result*********

                    exec(`rm ${targetSource}; rm ${targetExe}; rm ${targetInput}`, (errorRm, stdoutRm, stderrRm) => {
                        if (errorRm) {
                            console.log(`errorRm: ${errorRm.message}`);
                            return;
                        }
                    
                        if (stderrRm) {
                            console.log(`stderrRm: ${stderrRm}`);
                            return;
                        }
                    
                        console.log(`stdoutRm: ${stdoutRm}`);
                    });
                });
            });
        });
    });
});