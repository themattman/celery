var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , map          = require('./map.js').map
  , reduce       = require('./reduce.js').reduce
  , fbdata       = require('./fbdata.js')
  , num_results  = 400
  , access_token = 'CAACEdEose0cBAEOat5wTgItVQMZAvgWlLsUY1LrduSVfaFXv8DuuGjC2Nf4iItnZB5rdL2hJqhtRyu4syiCJiTVgEfpVwKxgGQ6UvbsxAzxU9SjjeGPjzpasdovaEZCBq4Uft69PwG53ZBbwBXmgzqcFm6nr7UZADNNnziaMK6yZCg5CL2Mg7edpDT8Ip45AMHZBtX6tuCrPAZDZD'
  , fbid         = '343199955727621'
  , fblink       = 'https://graph.facebook.com/'+fbid+'/feed?limit='+num_results+'&access_token='+access_token
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

exports.drop = function(req, res){
  MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
    db.collection('graphdata', function(err, col){if(err){throw err;}
      col.remove({}, function(err){if(err){console.log(err);}
        db.collection('graphdata1', function(err, col2){if(err){throw err;}
          col2.remove({}, function(err){if(err){console.log(err);}
            res.send('ok');
          });
        });
      });
    });
  });
};

exports.mapReduce = function(req, res){
  //res.render('import', { unique: 'u', buy: 'b', sell: 's'});
  // Run MapReduce on the data
  MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
    db.collection('graphdata', function(err, col){if(err){throw err;}

      col.mapReduce(map, reduce, {out: 'graphdata1'}, function(err){
        if(err){throw err;}
        db.collection('graphdata1', function(err, col2){
          if(err){throw err;}

          col2.aggregate(
            { $project: { "value.buy": 1 , "_id": 0 } },
            { $unwind: "$value.buy" },
            { $group: { '_id': "$value.buy", 'num': { $sum: 1 } } },
            { $sort: { "num": -1 } },
            function(err, b){
              if(err){console.log(err);}
              console.log(b);

              col2.aggregate(
                { $project: { "value.sell": 1 , "_id": 0 } },
                { $unwind: "$value.sell" },
                { $group: { '_id': "$value.sell", 'num': { $sum: 1 } } },
                { $sort: { "num": -1 } },
                function(err, s){
                  if(err){console.log(err);}
                  if(s){console.log(s);}

                  col2.aggregate(
                    { $project: { "value.unique": 1 , "_id": 0 } },
                    { $unwind: "$value.unique" },
                    { $group: { '_id': "$value.unique", 'num': { $sum: 1 } } },
                    { $sort: { "num": -1 } },
                    function(err, u){
                      if(err){console.log(err);}
                      if(u){console.log(u);}
                      res.render('import', { unique: u, buy: b, sell: s});
                  });

              });
          });

        });//db.col
      });//mapReduce

    });//db.col
  });//connect
};

// main page
exports.index = function(req, res){
  res.render('index', { title: 'Matt Kneiser' });
};

exports.import = function(req, res){
  if(fbdata.getfbdata(fblink) === -1){
    res.send('err');
  }
  res.send('ok');
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