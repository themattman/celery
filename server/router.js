var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , request      = require('request')
  , map          = require('./map.js').map
  , reduce       = require('./reduce.js').reduce
  , access_token = 'CAACEdEose0cBAPMzzmDeRCxOOcF9jG4BJZB9WeuGaenNMFmW9u4S9iFMUZCNaotBGhBQl8qRGpifDM3jxVZAQIkU4NNESXw7aBbIRxsjJzP1kosGQTZBNJsUS1WRakApkCaGjQh59QXAUarZC2jPm8yIpXGa8ZCqz5zP2phAAE44OyI2aloxb7pjgg0sTlhf2PDmaKFUvZCZAAZDZD'
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
  request('https://graph.facebook.com/343198942394389/feed?access_token='+access_token, function(err, response, body){
    if(err){throw err;}
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
                /*col2.aggregate(
                  { $project: { "value.unique": 1 , "_id": 0 } },
                  { $unwind: "$value.unique" },
                  { $group: { '_id': "$value.unique", 'num': { $sum: 1 } } },
                  { $sort: { "num": -1 } },
                  function(err, d){
                    if(err){console.log(err);}
                    if(d){console.log(d);}
                    res.render('import', { data: d });
                    col2.remove({}, function(err){
                      if(err){console.log(err);}
                      col.remove({}, function(er){
                        if(err){console.log(err);}
                      });
                    });
                });*/

                col2.aggregate(
                  { $project: { "value.buy": 1 , "_id": 0 } },
                  { $unwind: "$value.buy" },
                  { $group: { '_id': "$value.buy", 'num': { $sum: 1 } } },
                  { $sort: { "num": -1 } },
                  function(err, b){
                    if(err){console.log(err);}
                    console.log('b');
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

                            col2.remove({}, function(err){
                              if(err){console.log(err);}
                              col.remove({}, function(err){
                                if(err){console.log(err);}
                              });
                            });
                        });

                    });

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