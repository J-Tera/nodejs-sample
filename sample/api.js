/**
 * 
 */

var express = require('express');
var router = express.Router();

// 
router.use(function timeLog(req, res, next) {
//  console.log('Time: ', Date.now());
  next();
});
// Bind root
router.get('/', function(req, res) {
  res.send({ res: "OK" });
});
// Bind about
router.get('/about', function(req, res) {
  res.send({ res: "OK","body":"This is api." });
});

//Bind user
router.get('/user', function(req, res) {
  res.send("Hello " + req.query.user + "!");
});
router.get('/user/:user', function(req, res) {
  res.send("Hello " + req.params.user + "!");
});

module.exports = router;

