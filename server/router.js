var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , request      = require('request')
  , access_token = 'CAACEdEose0cBACJLCxeFf67RZA535VWN068GqaUiAcc9xx8BrRJ0yulw3Oid2c1HTfQget7JxBrLSz0mmPdPIQu1HQZC3W01izSgNtEUOU3QGwsbF7znYhJACMZAvWab7zMnKZAQ0kaykgjZC3dl6F9cIyHsUmcc1lrkaRsXW8PEgmx90qehKaPEUQZAFrFbU9H4R0o90ALAZDZD'
;

var map = function(){
  var stop_words = ['the', 'a', 'message'];
  this.unique = [];
  var str_arr = this.message.split(' ');
  for(var i in str_arr){

    // Replace all punctuation
    str_arr[i].replace(/\W/g, '');

    // If the remaining word is not a stop word or already in uniques, add it to the uniques array!
    if(stop_words.indexOf(str_arr[i].toLowerCase()) === -1 && this.unique.indexOf(str_arr[i].toLowerCase()) === -1){
      this.unique.push(str_arr[i]);
    }
  }
  emit(this._id, this);
};

var reduce = function(key, value){
  return value;
};



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
  request('https://graph.facebook.com/343198942394389/feed?access_token='+access_token, function(err, response, body){
    if(err){throw err;}
    console.log(response);
    if(response.body.indexOf('error') && response.statusCode == 200) {
      body = JSON.parse(body);
      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db) {
        if(err){throw err;}
        db.collection('graphdata', function(err, col){
          if(err){throw err;}
          col.insert(body.data, function(err, resp){
            if(err){throw err;}
            console.log('Done inserting');
            console.log(map, reduce);
            console.log(col.mapReduce);
            col.mapReduce(map, reduce, {out: 'graphdata1'}, function(err, d){
              //console.log(err);
              //console.log(d);
            });
            res.send('legit');
          });
        });
      });
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