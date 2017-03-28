/**
 *
 */

var express = require('express');
var router = express.Router();
var utils = require('./utils');
var dbutils = require('./dbutils');
var db;

//router.use(function timeLog(req, res, next) {
//console.log('Time: ', Date.now());
//next();
//});

//Bind root
router.get('/create', function(req, res) {
	res.render('new.ect', {title: '新規作成'});
});

router.post('/create', function(req, res){
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
	  var datelist = req.body.option;
	  var dat = [];
	  for( i = 0; i < datelist.length; i++) {
	    if(datelist[i] !== "") {
	      dat.push(datelist[i]);
	    }
	  }
	  newdoc.datelist = dat;

	    dbutils.insert(db, newdoc)
	    .then(function() {
	      res.redirect('/event/hotspot?id='+newdoc._id);
	    });
	});
router.setDB = function(_db) {
	  db = _db;
};
module.exports = router;


/* server.js よりコピー
 *
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
*
*/


