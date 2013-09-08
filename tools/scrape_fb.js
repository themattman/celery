var program = require('commander')
  , num_results  = 100 //at least this much d
;
program
  .version('0.0.1')
  .option('-n, --number <n>', 'num_results')
  .parse(process.argv)
;
if(program.number){num_results = program.number; console.log(program.number);}
//console.log(require('process'));

var cur_results  = 0
  , MongoClient  = require('mongodb').MongoClient
  , secret       = require('../server/secret').localdb
  , request      = require('request')
  , access_token = 'CAACEdEose0cBAOiZApUZAvIqgjm5jEGDDDCJCU1EcuoZCK4GU438As4a1i1IsNlzO69Pjq7ZBLZCmKsNCfe0Gt5hINltOwYWF2oI9oPESTVEJZA1AjlZBMBnr7ZCegrbLouOTcPAvZAVzQjlIcNl8eWO1dKLz8iZCyC2tk0MHvwLG0kbtAp4dYtDKLFVqxZBBHqxbgNPJ24XOe43wZDZD'
  , fbid         = '343214415726175'
  , fblink       = 'https://graph.facebook.com/'+fbid+'/feed?limit='+num_results+'&access_token='+access_token
;

fbdata(fblink);
console.log('all done :)');

function fbdata(link){
  // Iterate through the Graph API and throw docs into Mongo
  request(link, function(err, response, body){
    if(err){throw err;}
    if(response.statusCode == 200) {

      body = JSON.parse(body);
      cur_results += body.data.length;
      console.log('fb response len =', body.data.length);
      console.log('total number of posts', cur_results);

      MongoClient.connect('mongodb://'+secret.url+':'+secret.port+'/'+secret.name, function(err, db){if(err){throw err;}
        db.collection('graphdata', function(err, col){if(err){throw err;}
          col.insert(body.data, function(err, resp){if(err){console.log(err);}
          });
        });
      });

      console.log(body.paging);
      console.log(body);
      if(body.paging){
        var fblink = body.paging.next;

        if(cur_results < num_results){
          console.log('recurse!');
          console.log(fblink);
          fbdata(fblink);
        } else {
          console.log(cur_results);
          process.exit(1);
        }
      }

    } else {
      console.log('something went wrong', response.statusCode);
      console.log(JSON.parse(response.body));
    }

  }); //response
}