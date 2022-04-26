const express = require("express")
var http = require('http');
var path = require('path');

const app = express()

//config
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'public')));

//routes
const compilerRouter = require("./src/compiler/compiler")
app.use("/compiler", compilerRouter)


// app.listen(3000)
http.createServer(app).listen(app.get('port'), function(){
	console.log('node compiler active on port ' + app.get('port'));
});
