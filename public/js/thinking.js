Courses Collection:
{
	course_name: "ioe265",
	items: [
		"book",
		"coursepack"
	],
	prices: [
		"$300",
		"$250"
	]
}

Prices Collection:
{

}

graphdata Collection:
{
	"buy" : [ ],
	"sell" : [
		"textbook"
	],
	"unique" : [
		"anybody"
	],
	"price" : [ ],
	"course" : [
		"ioe333"
	]
}

db.graphdata1.aggregate([
	{$project: {
		"value.course": 1, 
		"value.price": 1,
		"value.sell": 1,
		"value.buy": 1
	}},
	{ $unwind: "$value.course"}, 
	{ $group: { 
		_id: "$value.course",
		"price": "$value.price",
		"sell": "$value.sell",
		"buy": "$value.buy"
	}}
]);


var map = function(){
	var obj = {};
	obj.price = [];
	obj.sell = [];
	obj.buy = [];
	obj.price = this.value.price;
	obj.sell = this.value.sell;
	obj.buy = this.value.buy;
	for(var i = 0; i < this.value.course.length; i++){
		emit(this.value.course[i], obj);
	}
};

var reduce = function(key, values){
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