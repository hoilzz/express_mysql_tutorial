
// [LOAD PACKAGES]
var express = require('express');
var app	= express();
var ejsLint = require('ejs-lint');
var bodyParser = require('body-parser');
var iconv = require('iconv');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'book_store'
});


app.set('views', './views');
app.set('view engine', 'ejs');


// [CONFIGURE ROUTER]

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});



// [CONFIGURE APP TO USE BodyParser]
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 3000;


// [RUN SERVER]
var server = app.listen(port, function(){
	console.log("Express server has started on port " + port)
});
var router = require('./routes')(app, mysql, connection);
