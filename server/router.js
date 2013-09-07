var mongo = require('./database.js')
;

/*mongo.connect(function(msg) {
  if(msg == null)
    console.log("Mongo Connected!");
  else 
    console.log(msg);
});*/

// admin page
exports.admin = function(req, res){
  res.send("<h3> You must be and admin! </h3>");
};

// db test
exports.db = function(req, res){
  mongo.db.collection("test", function(err, collection){
    collection.insert({ msg: "hello world" }, function(err, docs){
      if(err) throw err
      res.send(docs);
    });
  })
};

// main page
exports.index = function(req, res){
  res.render('index', { title: 'Matt Kneiser' });
};