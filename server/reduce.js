exports.reduce = function(key, value){
  return value;
};

exports.course_reduce = function(key, values){
  var obj = {};
  obj.price = [];
  obj.sell = [];
  obj.buy = [];
  for(var i = 0; i < values.length; i++){
    obj.price = obj.price.concat(values[i].price);
    obj.sell = obj.sell.concat(values[i].sell);
    obj.buy = obj.buy.concat(values[i].buy);
  }
  return obj;
};