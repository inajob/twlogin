function ElmCacher(){
    this.cache = {};
}
ElmCacher.prototype = {
    put:function(key, value){
	this.cache[key] = value;
    },
    get:function(key){
	return this.cache[key];
    }
}