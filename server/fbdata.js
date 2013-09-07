var MongoClient  = require('mongodb').MongoClient
  , secret       = require('./secret').localdb
  , request      = require('request')
;

exports.getfbdata = function(link){
  console.log('fblink', link);
  // Iterate through the Graph API and throw docs into Mongo
  request(link, function(err, response, body){
    if(err){throw err;}
    if(response.statusCode == 200) {

      body = JSON.parse(body);

      // Insert all the FB posts into MongoDB
      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
        db.collection('graphdata', function(err, col){if(err){throw err;}
          col.insert(body.data, function(err, resp){if(err){throw err;}
          });
        });
      });

      return 0;

    } else {
      // Error out if something was wrong with the FB request
      console.log(JSON.parse(response.body));
      console.log(response.statusCode);
      return -1;
    }

  });//request
}