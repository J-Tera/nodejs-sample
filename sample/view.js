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
router.get('/view', function(req, res) {
  var id = req.query.id;
  if (id === undefined || id === null || id === "") {
    res.send("Invalid doc id");
    return;
  }
  dbutils.getOne(db, id)
  .then(function(doc){
    res.render('mainView.ect', {title: 'View', 'doc' : doc});
  });
});

router.setDB = function(_db) {
  db = _db;
};

router.get('/calc', function(req, res) {
  res.render('calculator.ect', {title: 'Calc'});
});


module.exports = router;

