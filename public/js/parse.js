//var str = "Buying MATH 465! (can can someone sell to TBP book swap plz! :P)";
//var str = "Buying ND for $100, message me";
//var str = "Buying IOE333 book and coursepack";
//var str = "looking for NERS211(Nuclides and Isotopes : Chart of the Nuclides 17th Edition - Knolls Atomic Power Lab)";
var str = "hey my\nname   is.";
document.write(str);
var str_arr = str.split(/[ \n]/);
for(var i = 0; i < str_arr.length; i++){
  document.write("<br>["+str_arr[i]+"]");
}
document.write("<br>"+str_arr.length);

//tokenize(str);

function tokenize (str) {
  // Stop words src: http://www.textfixer.com/resources/common-english-words.txt
  var stop_words = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your','plz','pls','please','message','someone'];

  var buying = ["buy", "buying"];
  var selling = ["sell", "selling"];

  // Create a new field for the unique words in the FB Post
  buy = [];
  sell = [];
  unique = [];
  price = [];
  course = [];

  // Lower Case the FB Post
  str = str.toLowerCase();

  // Split on space characters
  var str_arr = str.split(' ');

  // Set to 0 when a "buy" term is found, 1 when "sell" term found
  // -1 before that
  var buysell = -1;

  // Skips the next iteration of the loop if you find a course name+number
  var course_bool = false;

  for(var i = 0; i < str_arr.length; i++){
    if(!course_bool){
      var special = false;

      // Trim ending punctuation
      str_arr[i] = str_arr[i].replace(/[,.?!:;-=+]+$/, '');

      // Check for links
      if(str_arr[i].match(/http(s)?:\/\/[^ ]+/) || str_arr[i].match(/www.[^ ]+.[^ ]+/)){str_arr[i]="";}//special = true;}
      // Check for email address
      if(str_arr[i].match(/[^ ]+@[^ ]+.[^ ]+/)){str_arr[i] = "";}

      // Course Name Classifier
      if(i+1 < str_arr.length){
        str_arr[i+1] = str_arr[i+1].replace(/[,.?!:;-=+]+/g, '');
        if(str_arr[i].match(/^[a-z]+$/) && str_arr[i+1].match(/^[0-9]+$/)){
          course.push(str_arr[i] + str_arr[i+1]);
          course_bool = true;
          continue;
        }
      }
      if(str_arr[i].match(/^[a-z]+[0-9]+$/)){
        course.push(str_arr[i]);
        continue;
      }

      console.log(str_arr[i]);

      // Check for money
      if(str_arr[i].match(/^[$][0-9]+$/)){
        price.push(str_arr[i]);
        continue;
      }

      // Replace all punctuation
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
      if(str_arr[i].length > 1 && stop_words.indexOf(str_arr[i]) === -1 && unique.indexOf(str_arr[i]) === -1 && buying.indexOf(str_arr[i]) === -1 && selling.indexOf(str_arr[i]) === -1){
        if(buysell === 0){
          buy.push(str_arr[i]);
        } else if(buysell == 1){
          sell.push(str_arr[i]);
        } else {
          unique.push(str_arr[i]);
        }
      }
    } else {
      course_bool = false;
    }//course_bool
  }

  document.write('<br>[BUY] -- ');
  document.write(JSON.stringify(buy));
  document.write('<br>[SELL] -- ');
  document.write(JSON.stringify(sell));
  document.write('<br>[UNIQUE] -- ');
  document.write(JSON.stringify(unique));
  document.write('<br>[PRICE] -- ');
  document.write(JSON.stringify(price));
  document.write('<br>[COURSE] -- ');
  document.write(JSON.stringify(course));
}