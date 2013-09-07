var MongoClient = require('mongodb').MongoClient
  , secret      = require('./secret')
;

// admin page
exports.admin = function(req, res){
  res.send("<h3> You must be and admin! </h3>");
};

// db test
exports.db = function(req, res){
  mongo.db.collection("graphdata", function(err, collection){
    collection.insert({ msg: "hello world" }, function(err, docs){
      if(err){throw err;}
      res.send(docs);
    });
  })
};

// main page
exports.index = function(req, res){
  res.render('index', { title: 'Matt Kneiser' });
};

// Celery Splash Page
exports.search = function(req, res){
  MongoClient.connect('mongodb://'+secret.db.url+':'+secret.db.port+'/'+secret.db.name, function(err, db) {
    if(err){throw err;}
    db.authenticate(secret.db.user, secret.db.pass, function(err, auth){
      db.collection('graphdata', function(err, col){
        if(err){throw err;}
        col.find({}).toArray(function(err, docs){
          if(err){throw err;}
          console.log(docs);
          res.render('search', { 'results': docs });
        });
      });
    });
  });
};