/**
 * Server for the Sample app
 */

var express = require('express');
var ECT = require('ect');
var app = express();
var http = require('http');
var utils = require('./utils');
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
  res.render('index.ect', {title: 'ようこそ ' + name, "name" : name});
});

app.get('/create', function(req, res){
  res.render('new.ect', {title: '新規作成'});
});

app.post('/create', function(req, res){
  var newdoc = {};
  newdoc._id = utils.createId();
  newdoc.name = req.body.name;
  newdoc.description = req.body.description;
  var errors = [];
  if(newdoc.name === "" ) {
    errors.push({id:"name", msg : "Please input name"});
  }
  if(errors.length > 0) {
    res.render('new.ect', {title: '新規作成', 'errors' : errors});
    return;
  }
    dbutils.insert(db, newdoc)
    .then(function() {
      res.redirect('/update?id='+newdoc._id);
    });
});

app.get('/update', function(req, res){
  var id = req.query.id;
  if (id === undefined || id === null || id === "") {
    res.send("Invalid doc id");
    return;
  }
  dbutils.getOne(db, id)
  .then(function(doc){
//    att = [];
//    att.push({name:"AAA AAA"},{name:"BBB BBB"});
//    doc.attendantees = att;
    res.render('update.ect', {title: 'Update', 'doc' : doc});
  });

});
app.post('/update', function(req, res){
  var id = req.body.id;
  var name = req.body.name;
  var description = req.body.description;
  var attendantees = req.body.attendantees;
  console.log(attendantees);
  var errors = [];
  if(name === "" ) {
    errors.push({id:"name", msg : "Please input name"});
  }

  dbutils.getOne(db, id)
  .then(function(doc){
    if(errors.length > 0) {
      res.render('update.ect', {title: 'Update', 'doc' : doc, 'errors' : errors});
      return;
    }
    doc.name = name;
    doc.description = description;
    return dbutils.insert(db, doc);
  }).then(function(){
    return dbutils.getOne(db, id);
  }).then(function(doc){
    res.render('update.ect', {title: 'Update', 'doc' : doc});
  });

});

app.put('/adddate', function(req, res){
  var id = req.body.id;
  var datelist = req.body.datelist;
  var dat = [];
  for( i = 0; i < datelist.length; i++) {
    if(datelist[i] !== "") {
      dat.push(datelist[i]);
    }
  }
  dbutils.getOne(db, id)
  .then(function(doc){
    doc.datelist = dat;
    return dbutils.insert(db, doc);
  });
});

app.put('/addatt', function(req, res){
  var id = req.body.id;
  var attendantees = req.body.attendantees;
  var att = [];
  for( i = 0; i < attendantees.length; i++) {
    if(attendantees[i] !== "") {
      att.push(attendantees[i]);
    }
  }
  dbutils.getOne(db, id)
  .then(function(doc){
    doc.attendantees = att;
    return dbutils.insert(db, doc);
  });
});


//// Bind the '/login' URL
//app.post('/login', function(req, res){
//  var name = req.body.name;
//  req.session.name = name;
//  res.render('main.ect', {title: 'Hello ' +name });
//});

app.get('/list', function(req, res){
  var parms = {include_docs:true};
  db.list(parms, function(err, body) {
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

var view = require('./view');
view.setDB(db);
app.use('/view', view);

// Server start
var server = app.listen(port, function() {
  console.log('Server running on port %d on host %s', server.address().port, host);
});
process.on('exit', function() {
  console.log('Server is shutting down!');
});

// for Hotspot URL page
app.use('/event', require('./hotspot.js')( 
	key => dbutils.getOne(db, key) 
));

// for status update 
app.use('/status', require('./status.js')( 
	key => dbutils.getOne(db, key),
	event => dbutils.insert(db, event)
));
