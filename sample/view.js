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



var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var text_to_speech;
text_to_speech = new TextToSpeechV1 ({
  "username": "2ca0c82b-1500-481c-8964-87681aba3287",
  "password": "WghrxcQ8uG8y"
});

router.get('/speak', function(req, res){
  res.render('speak.ect', {title: 'Speak'});
});

router.get('/speaktext', function(req, res) {
  var text = req.query.text;
  var params = {
      'text': text,
      'voice': 'ja-JP_EmiVoice'
    };

    // Pipe the synthesized text to a file.
    text_to_speech.synthesize(params).on('error', function(error) {
      console.log('Error:', error);
    }).pipe(res);
});

/**For file upload
 * 
 */
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post('/speaktext', upload.single('files'), function(req, res) {
//console.log(req.file.buffer.toString());
//  req.file.buffer.toString().split("\n").forEach(function(str){
//    console.log(str);
//  });
  
  
  var params = {
      'text': req.file.buffer.toString(),
      'voice': 'ja-JP_EmiVoice'
    };
  // Pipe the synthesized text to a file.
  text_to_speech.synthesize(params).on('error', function(error) {
    console.log('Error:', error);
  }).pipe(res);
});

module.exports = router;

