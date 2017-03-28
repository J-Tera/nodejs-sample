/**
 *
 */

var express = require('express');
var router = express.Router();
var dbutils = require('./dbutils');
var db;

//
//router.use(function timeLog(req, res, next) {
////  console.log('Time: ', Date.now());
//  next();
//});
// Bind root
router.get('/shukei', function(req, res) {
  var id = req.query.id;
  if (id === undefined || id === null || id === "") {
    res.send("Invalid doc id");
    return;
  }
  var name = req.query.name;
  if (name === undefined || name === null || name === "") {
	    res.send("Invalid name");
	    return;
	  }
  dbutils.getOne(db, id)
  .then(function(doc){
    res.render('shukei.ect', {title: 'shukei', 'doc' : doc, 'name' : name});
  });
});

router.setDB = function(_db) {
  db = _db;
};
module.exports = router;

