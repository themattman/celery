var MongoClient = require('mongodb').MongoClient
  , secret      = require('./secret').localdb
  , request     = require('request')
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

exports.import = function(req, res){
  request('https://graph.facebook.com/343198942394389/feed?access_token=CAACEdEose0cBAAOyBcNBVE3TOvFipEAZBljbjejbvMpxvfSuVDoiqKzgVCkSeCV0Xu53nEf1zCZBeHrD3v39o4NfGVQfZCVPk5RlkUfUwOVRDZBwFqIZCZBGXzI6VtiUk2o6hEszgZAaPVRJcDXFNEkMZApsZC1MeKug7soPdRoRiuopP2om8H69FrH6kT12iHZC82T6UJYJVDGQZDZD', function(err, response, body){
    if(err){throw err;}
    console.log(response);
    if(response.body.indexOf('error') && response.statusCode == 200) {
      //console.log(body);
      body = JSON.parse(body);

      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db) {
        if(err){throw err;}
        db.authenticate(secret.user, secret.pass, function(err, auth){
          db.collection('graphdata', function(err, col){
            if(err){throw err;}
            //console.log(body);
            col.insert(body.data, function(err, resp){
              if(err){throw err;}
              console.log(err);
              console.log(resp);
            });
          });
        });
      });

      res.render('import', { 'results': body.body });
    } else {
      res.send('err');
    }
  });
};

// Celery Splash Page
exports.search = function(req, res){
  MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db) {
    if(err){throw err;}
    db.authenticate(secret.user, secret.pass, function(err, auth){
      db.collection('graphdata', function(err, col){
        if(err){throw err;}
        col.find({}).limit(10).toArray(function(err, docs){
          if(err){throw err;}
          console.log(docs);
          res.render('search', { 'results': docs });
        });
      });
    });
  });
};