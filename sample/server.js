/**
 * Server for the Sample app
 */

var express = require('express');
var ECT = require('ect');
var app = express();
var http = require('http');
var dbutils = require('./dbutils');

var host = "localhost";
var port = 3030;
var cloudant = {
  url : "https://c88ff3e4-2ea3-4a48-9763-b9919539b731-bluemix:202c0e67ef024a7ca1c3912cb9b34d0c2066be3901de75f589b7850aa671761a@c88ff3e4-2ea3-4a48-9763-b9919539b731-bluemix.cloudant.com"
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
var db = nano.use('sample');

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
    },
    resave: true,
    saveUninitialized: true
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

//URL Bindin starts from here


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

//
app.get('/insert', function(req, res){
  dbutils.listAll(db).then(function(value) {
    res.render('insert.ect', {title: 'insert', 'docs' : value});
  });
});

app.post('/insert', function(req, res){
  var name = req.body.name;
  var title = req.body.title;
  var url = req.body.url;
  //最新の文書を取得する
  dbutils.getOne(db, name)
  .then(function(doc){
    doc._id = name;
    doc.title = title;
    doc.url = url;
    return dbutils.insert(db, doc);})
  .then(function() {
    return dbutils.listAll(db);})
  .then(function(docs){
    res.render('insert.ect', {title: 'insert', 'docs' : docs});
  });
});

app.get('/search', function(req, res) {
  var name = req.query.name;
//  var title = req.query.title;
//  var url = req.query.url;
  db.get(name, function(err, doc) {
    if (!err) {
      console.log(doc);
      res.send(doc);
    } else {
      res.send({name:'',title:'',url:''});
    }
  });
});

app.get('/list', function(req, res){
  db.list({include_docs:true}, function(err, body) {
    var resObject = [];
    if (!err) {
      body.rows.forEach(function(doc) {
        resObject.push(doc.doc);
      });
    } else {
      console.log(err);
    }
    res.render('list.ect', {title: 'List', 'docs' : resObject});
  });
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
