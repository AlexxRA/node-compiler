const express = require("express")
const router = express.Router()
var cp = require('child_process');
var Sync = require('sync');

router.use(logger)

var child = cp.fork(__dirname + '/child.js');
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
router.post('/compile', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');

    var script = req.body.script;
    var inputs = req.body.inputs;

    addTask({script, inputs}, (result) => {
        res.json(result);
    });
	
});
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
