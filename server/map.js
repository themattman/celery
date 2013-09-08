exports.map = function(){
  // Stop words src: http://www.textfixer.com/resources/common-english-words.txt
  var stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your','plz','pls','please','message','someone','january','february','march','april','june','july','august','september','october','november','december','anybody','contact','interested','2010','2011','2012','2013','2014','easy','hard','ed','th','st','msg','ticket'];

  var buying = ["buy", "buying"];//, "looking for"];
  var selling = ["sell", "selling"];

  // Create a new field for the unique words in the FB Post
  this.buy = [];
  this.sell = [];
  this.unique = [];
  this.price = [];
  this.course = [];

  // Stupid js check
  if(this.message){

    // 1) Lower Case the FB Post
    this.message = this.message.toLowerCase();

    // 2) Split on space & newline characters
    var str_arr = this.message.split(/[ \n]/);

    // 3) Buy/Sell by-word classifier
    //      Set to 0 when a "buy" term is found, 1 when "sell" term found
    //      -1 before that
    var buysell = -1;

    // Skips the next iteration of the loop if you find a course name+number
    var course_bool = false;

    for(var i = 0; i < str_arr.length; i++){
      if(!course_bool){
        var special = false;

        // 4) Trim beginning/ending punctuation
        str_arr[i] = str_arr[i].replace(/[,.?!:;-=+'"(){}]+$/, '');
        str_arr[i] = str_arr[i].replace(/^[,.?!:;-=+'"(){}]+/, '');
        str_arr[i] = str_arr[i].replace(/\n/g, ' ');

        // 5) Check for links
        if(str_arr[i].match(/http(s)?:\/\/[^ ]+/) || str_arr[i].match(/www.[^ ]+.[^ ]+/)){str_arr[i]="";}
        // 6) Check for email address
        if(str_arr[i].match(/[^ ]+@[^ ]+.[^ ]+/)){str_arr[i] = "";}

        // 7) Course Name Classifier
        if(i+1 < str_arr.length){
          str_arr[i+1] = str_arr[i+1].replace(/[,.?!:;-=+'"(){}]+$/, '');
          // Both aren't stop words
          if(stop_words.indexOf(str_arr[i]) === -1 && stop_words.indexOf(str_arr[i+1]) === -1){
            if(str_arr[i].match(/^[a-z]{2,7}$/) && str_arr[i+1].match(/^[0-9]{3,4}$/)){
              this.course.push(str_arr[i] + str_arr[i+1]);
              course_bool = true;
              continue;
            }
          }
        }
        if(str_arr[i].match(/^[a-z]{2,7}[0-9]{3,4}$/)){
          this.course.push(str_arr[i]);
          continue;
        }

        // 8) Check for money
        if(str_arr[i].match(/^[$][0-9]+$/)){
          this.price.push(str_arr[i].substr(1,str_arr[i].length-1));
          continue;
        }

        // 9) Replace all punctuation
        if(!special){
          str_arr[i] = str_arr[i].replace(/[~!@#$%\/\^&*()~+-={}[]|:;'"?<>.,\n]*/g, '');
        } else {
          str_arr[i] = str_arr[i].replace(/[.!,?]+$/, '');
        }

        if(~buying.indexOf(str_arr[i])){
          buysell = 0;
        } else if(~selling.indexOf(str_arr[i])){
          buysell = 1;
        }

        // If the remaining word is not a stop word or already in uniques, add it to the uniques array!
        if(str_arr[i].length > 1 && stop_words.indexOf(str_arr[i]) === -1 && this.unique.indexOf(str_arr[i]) === -1 && buying.indexOf(str_arr[i]) === -1 && selling.indexOf(str_arr[i]) === -1){
          if(buysell === 0){
            this.buy.push(str_arr[i]);
          } else if(buysell == 1){
            this.sell.push(str_arr[i]);
          } else {
            this.unique.push(str_arr[i]);
          }
        }
      } else {
        course_bool = false;
      }//course_bool
    }
  }
  emit(this._id, this);

};

exports.course_map = function(){
  var obj = {};
  obj.price = [];
  obj.sell = [];
  obj.buy = [];
  if(this.value){
    obj.price = this.value.price;
    obj.sell = this.value.sell;
    obj.buy = this.value.buy;
    for(var i = 0; i < this.value.course.length; i++){
      emit(this.value.course[i], obj);
    }
  }
};