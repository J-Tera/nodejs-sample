/**
 * Server for the Sample app
 */

var express = require('express');
var ECT = require('ect');
var app = express();
var http = require('http');

var host = "localhost";
var port = 3030;
var cloudant = {
  url : "https://f5452bb8-7d86-4198-9fa1-76a9d0a55727-bluemix:6130b19398e8fd33feaab49df054638945906fc47fe22bb25b8035a4eee31d6e@f5452bb8-7d86-4198-9fa1-76a9d0a55727-bluemix.cloudant.com" // TODO: Update		 		 
};

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
  // Running on Bluemix. Parse  port and host
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var host = process.env.VCAP_APP_HOST;
  var port = process.env.VCAP_APP_PORT;

  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);
  // Also parse Cloudant settings.
  cloudant = env['cloudantNoSQLDB'][0].credentials; 
}

var nano = require('nano')(cloudant.url);
var db = nano.db.use('guess_the_word_hiscores');

//Session
var cookieParser = require('cookie-parser');
app.use(cookieParser()); 
var bodyParser = require('body-parser');
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

var session = require('express-session');
app.use(session({
    secret: 'secret',
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    }
}));

// Set path to Jade template directory
app.set('views', __dirname + '/views');

// Set path to JavaScript files
app.set('js', __dirname + '/js');

// Set path to CSS files
app.set('css', __dirname + '/css');

// Set path to image files
app.set('images', __dirname + '/images');

// Set path to sound files
app.set('sounds', __dirname + '/sounds');

// Set path to static files
app.use(express.static(__dirname + '/public'));

app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

// Bind the root '/' URL
app.get('/', function(req, res){
  var name = "";
  if( req.session.name && req.session.name != "") {
	  name = req.session.name;
  }
  res.render('index.ect', {title: 'Login ' + name, "name" : name});
});

// Bind the '/login' URL
app.post('/login', function(req, res){
  var name = req.body.name;
  req.session.name = name;
  res.render('main.ect', {title: 'Hello ' +name });
});

// Sub module
var api = require('./api');
app.use('/api', api);


// Server start
var server = app.listen(port, function() {
  console.log('Server running on port %d on host %s', server.address().port, host);
});

process.on('exit', function() {
  console.log('Server is shutting down!');
});
