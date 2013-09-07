var num_results  = 100 //at least this much
  , MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , request      = require('request')
  , cur_results  = 0
;

exports.fbdata = function(link){
  // Iterate through the Graph API and throw docs into Mongo
  request(link, function(err, response, body){
    if(err){throw err;}
    if(response.statusCode == 200) {

      body = JSON.parse(body);
      cur_results += body.data.length;
      console.log(body.data.length, cur_results);

      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
        db.collection('graphdata', function(err, col){if(err){throw err;}
          col.insert(body.data, function(err, resp){if(err){throw err;}
          });
        });
      });

      console.log(body.paging);
      if(body.paging){
        //console.log(body.paging.next);
        var fblink = body.paging.previous;

        if(cur_results < num_results){
          console.log('recurse!');
          console.log(fblink);
          exports.fbdata(fblink);
        }
      }

    } else {
      res.send('err');
    }

  }); //response
}