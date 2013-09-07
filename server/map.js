exports.map = function(){
  // Stop words src: http://www.textfixer.com/resources/common-english-words.txt
  var stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your'];

  var buying = ["buy", "buying"];//, "looking for"];
  var selling = ["sell", "selling"];

  // Create a new field for the unique words in the FB Post
  this.buy = [];
  this.sell = [];
  this.unique = [];

  // Lower Case the FB Post
  if(this.message){
    this.message = this.message.toLowerCase();

    // Split on space characters
    var str_arr = this.message.split(' ');

    // Set to 0 when a "buy" term is found, 1 when "sell" term found
    // -1 before that
    var buysell = -1;

    for(var i = 0; i < str_arr.length; i++){

      var special = false;
      // Check for links
      if(str_arr[i].match(/http(s)?:\/\/[^ ]+/) || str_arr[i].match(/www.[^ ]+.[^ ]+/)){
        special = true;
      }
      // Check for email address
      if(~str_arr[i].match(/[^ ]+@[^ ]+.[^ ]+/)){
        special = true;
      }
      // Check for money
      if(~str_arr[i].match(/[$][ ]?[0-9]+/)){
        special = true;
      }

      // Replace all punctuation
      if(!special){
        str_arr[i] = str_arr[i].replace(/[^a-zA-Z0-9$]*/g, '');
      } else {
        str_arr[i] = str_arr[i].replace(/[.!,?]+$/, '');
      }

      if(~buying.indexOf(str_arr[i])){
        buysell = 0;
      } else if(~selling.indexOf(str_arr[i])){
        buysell = 1;
      }

      // If the remaining word is not a stop word or already in uniques, add it to the uniques array!
      if(stop_words.indexOf(str_arr[i]) === -1 && this.unique.indexOf(str_arr[i]) === -1 && buying.indexOf(str_arr[i]) === -1 && selling.indexOf(str_arr[i]) === -1){
        if(buysell === 0){
          this.buy.push(str_arr[i]);
        } else if(buysell == 1){
          this.sell.push(str_arr[i]);
        } else {
          this.unique.push(str_arr[i]);
        }
      }
    }
  }
  emit(this._id, this);

};