var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , map          = require('./map.js')
  , reduce       = require('./reduce.js')
  , fbdata       = require('./fbdata.js')
  , num_results  = 400
  , access_token = 'CAACEdEose0cBADuWgg6lU2cj3DZB8UNckCKc11zDsInqAAJ1oxVNZCqiYHU6IEIF3629eaezBWlxZAwBOmZB4s74ruLY1cnxJlyZA0A93zIjZC1MmwJhThHcJzGfBLc7ZCBL9h7ZAEX50LBcBK6NL7fLtRuV5VmZBHwGRM9oP8sEhtwFXO74U9G88X8ZBSRUWygUQvngeHTk5N9AZDZD'
  , fbid         = '343199955727621'
  , fblink       = 'https://graph.facebook.com/'+fbid+'/feed?limit='+num_results+'&access_token='+access_token
  , group_ids    = ['343199955727621', '343214415726175']
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
  // Run MapReduce on the data
  MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
    db.collection('graphdata', function(err, col){if(err){throw err;}

      col.mapReduce(map.map, reduce.reduce, {out: 'graphdata1'}, function(err){
        if(err){throw err;}
        db.collection('graphdata1', function(err, col2){
          if(err){throw err;}

          // BUY
          col2.aggregate(
            { $project: { "value.buy": 1, "_id": 0 } },
            { $unwind: "$value.buy" },
            { $group: { '_id': "$value.buy", 'num': { $sum: 1 } } },
            { $sort: { "num": -1 } },
            function(err, b){
              if(err){console.log(err);}
              if(b){console.log(b);}

              // SELL
              col2.aggregate(
                { $project: { "value.sell": 1, "_id": 0 } },
                { $unwind: "$value.sell" },
                { $group: { '_id': "$value.sell", 'num': { $sum: 1 } } },
                { $sort: { "num": -1 } },
                function(err, s){
                  if(err){console.log(err);}
                  //if(s){console.log(s);}

                  // UNIQUE
                  col2.aggregate(
                    { $project: { "value.unique": 1, "_id": 0 } },
                    { $unwind: "$value.unique" },
                    { $group: { '_id': "$value.unique", 'num': { $sum: 1 } } },
                    { $sort: { "num": -1 } },
                    function(err, u){
                      if(err){console.log(err);}
                      //if(u){console.log(u);}

                      // COURSE
                      col2.mapReduce(map.course_map, reduce.course_reduce, {out: 'courses'}, function(err){if(err){throw err;}
                        res.render('import', { unique: u, buy: b, sell: s});
                      });
                        //db.collection('courses', function(err, coll){if(err){throw err;}
                          /*coll.insert(c, function(err){if(err){throw err;}});
                          db.collection('prices', function(err, coll){if(err){throw err;}
                            coll.insert(p, function(err){if(err){throw err;}});
                          });*/

                          /*coll.insert(u, function(err){if(err){throw err;}});
                          coll.insert(b, function(err){if(err){throw err;}});
                          coll.insert(s, function(err){if(err){throw err;}});*/
                          //res.render('import', { unique: u, buy: b, sell: s});
                        //});

                      // COURSE
                      /*col2.aggregate(
                        { $project: { "$value.course": 1, "$value.price": 1, "$value.sell": 1, "$value.buy": 1, "_id": 0 } },
                        { $unwind: "$value.course" },
                        { $group: { '_id': "$value.course", 'value': { 'price': "$value.price", 'sell': "$value.sell", 'buy': "$value.buy" } } },
                        { $sort: { "num": -1 } },
                        function(err, c){
                          if(err){console.log(err);}
                          if(c){console.log(c);}

                          // PRICE
                          col2.aggregate(
                            { $project: { "value.price": 1, "_id": 0 } },
                            { $unwind: "$value.price" },
                            { $group: { '_id': "$value.price", '': { $avg: "$value.price" } } },
                            { $sort: { "num": -1 } },
                            function(err, p){
                              if(err){console.log(err);}
                              if(p){console.log(p);}*/





                          //});
                      //});
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
  res.render('index');
};

exports.import = function(req, res){
  result = fbdata.getfbdata(fblink);
  if(result === -1){
    res.send('err');
  }
  console.log(result);
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