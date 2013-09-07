var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , request      = require('request')
  , access_token = 'CAACEdEose0cBAN2PprI6YMcLSymxpBLEqvyecUAGAhXa48RuAoxRLnlUhK0WQTL7rifqQBmlZAjnFyLsTLMj5s35wMVGukF3BvaKBNSqfSdpESAZBLyL7h5Ln4TBJ4fMtH5YtagACoyAIRKySQRMtnrpPNoLqg1hs1rneVfUZBCfaD4JBZCU06kd8PrjuH8fyMJH1JUKiQZDZD'
;

var map = function(){
  // Stop words src: http://www.textfixer.com/resources/common-english-words.txt
  var stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your'];

  // Create a new field for the unique words in the FB Post
  this.unique = [];

  // Lower Case the FB Post
  this.message = this.message.toLowerCase();

  // Split on space characters
  var str_arr = this.message.split(' ');

  for(var i in str_arr){

    // Replace all punctuation
    str_arr[i] = str_arr[i].replace(/[^a-zA-Z0-9]+/g, '');

    // If the remaining word is not a stop word or already in uniques, add it to the uniques array!
    if(stop_words.indexOf(str_arr[i]) === -1 && this.unique.indexOf(str_arr[i]) === -1){
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
    //console.log(response);
    if(response.body.indexOf('error') && response.statusCode == 200) {
      body = JSON.parse(body);
      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db) {
        if(err){throw err;}
        db.collection('graphdata', function(err, col){
          if(err){throw err;}
          col.insert(body.data, function(err, resp){
            if(err){throw err;}
            console.log('Done inserting');
            col.mapReduce(map, reduce, {out: 'graphdata1'}, function(){
              db.collection('graphdata1', function(err, col2){
                col2.aggregate(
                  { $project: { "value.unique": 1 , "_id": 0 } },
                  { $unwind: "$value.unique" },
                  { $group: { '_id': "$value.unique", 'num': { $sum: 1 } } },
                  { $sort: { "num": -1 } },
                  function(err, d){
                    if(err){console.log(err);}
                    if(d){console.log(d);}
                    res.render('import', { data: d });
                });
              });
            });
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