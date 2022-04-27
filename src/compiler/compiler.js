const express = require("express")
const router = express.Router()
var cp = require('child_process');
var Sync = require('sync');

const { exec } = require('child_process');
const fs = require('fs');


router.use(logger)

var child = cp.fork(__dirname + '/child.js');
// var child = cp.fork(__dirname + '/childTest.js');
var taskId = 0;
var tasks = {};
var maxQueue = 10;

//********API ENDPOINTS **********/

//GET
router.get("/", (req, res) => {
  console.log(req.query.name)
  res.send("node compiler get")
})

//POST
router.post('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    var script = req.body.script;
    var inputs = req.body.inputs;

    addTask({script, inputs}, (result) => {
        res.json(result);
    });
	
});

//POST TEST
router.post('/test', async (req, res) => {
    var code = req.body.code;

    var fileName = 'script' + '_' + new Date().getTime().toString();
    var targetSource = __dirname+'/scripts/codeFiles/'+fileName+'.cpp';
    var targetExe = __dirname+'/scripts/exe/'+fileName;


    fs.writeFile(targetSource, code, (errorSource) => {
        if (errorSource){
            console.log(`errorSource: ${errorSource}`);
            res.status(400).json({
                message: errorSource,
                success: false
            });
        }else{
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
            });
        }
    });
    console.log("END!!!");
})
//********API ENDPOINTS **********/


function addTask(data, callback) {

    taskId++;
    if (taskId > 10) taskId = 1;
    Sync(function() {
        if (taskId > maxQueue) taskId = 1;

        child.send({id: taskId, script:data.script, inputs:data.inputs});

        tasks[taskId] = callback;
    });
}


function logger(req, res, next) {
  console.log(req.originalUrl)
  next()
}

child.on('message', (m) => {
    // Look up the callback bound to this id and invoke it with the result
    console.log('PARENT got message:', m);
    tasks[m.id](m);
});

module.exports = router
