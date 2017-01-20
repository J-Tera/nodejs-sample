module.exports = {
  listAll : function(db) {
    return new Promise(function(resolve, reject) {
      db.list({include_docs:true}, function(err, body) {
        var resObject = [];
        if (!err) {
          body.rows.forEach(function(doc) {
            resObject.push(doc.doc);
          });
        } else {
          console.log(err);
          reject("error")
        }
        resolve(resObject);
      });
    });
  },
  getOne : function(db, key) {
    return new Promise(function(resolve, reject) {
      db.get(key, function(err, doc) {
        if (err) {//なければ新しい文書を作成
          var doc = {};
        }
        resolve(doc);
      });
    });
  },
  insert : function(db, doc) {
    return new Promise(function(resolve, reject) {
      db.insert(doc, function(err) {
        if (!err) {
        } else {//DBへのInsert失敗した時だけメッセージを出す
          console.log("DB insert Fail");
        }
        resolve();
      });
    });
  }
}
