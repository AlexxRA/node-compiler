const express = require("express");
const router = express.Router();
const cp = require("child_process");



var child = cp.fork(__dirname + '/child.js');

//********API ENDPOINTS **********/

//POST
router.post('/', async (request, response) => {
  if (!request.body.code) 
    return response.status(400).json({
      message: "Error | Please provide a code to compile"
    });
  
  var code = request.body.code;

  child.send(code, (resultChild) => {
    await callback(resultChild);
  });
  
  await sendSubprocess(code, async (result) => {
    console.log(result);
    await response.json(result);
    // if (result.status == 200){
    //     res.status(200).json({
    //         success: result.success,
    //         output: success.output
    //     });
    // }
    // else{
    //     res.status(400).json({
    //         success: result.success,
    //         error: success.error
    //     });
    // }
  });

});

async function sendSubprocess(code, callback) {
  // Sync(function() {
  //     child.send(code, (resultChild) => {
  //         callback(resultChild);
  //     });
  // });
  await child.send(code, async (resultChild) => {
    await callback(resultChild);
  });
}
module.exports = router