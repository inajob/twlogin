var CSSC = function(){
    this.parser = new Gin.Grammar({
	    CSS: /(BLOCK:block|COMM)*/,
	    COMM:/<\/\*> <[^*]*> <\*\/>/,
	    BLOCK: /IDS:ids <{> LIST <}>/,
	    LIST: /ATTR:attr*/,
	    ATTR:/ID:name <:> IDV:value <;>/,
	    IDS:/IDSS:id+/,
	    IDSS: /<[.#,a-zA-Z0-9_\-:]+>/,
	    ID: /<[.#,a-zA-Z0-9_\-]+>/,
	    IDV: /<[.#,a-zA-Z0-9_\-()% ]+>/
	},"CSS", new Gin.Parser.RegExp(/[ \r\n]/));
    this.calcAction = {
	_stack:[],
	_ids:[],
	out:[],
	tmp:{},
	id:function(v){
	    //console.log('id:' + v);
	    this._stack.push(v + "");
	},
	ids:function(v){
	    var ids = [];
	    while(this._stack.length != 0){
	        ids.push(this._stack.pop());
	    }
	    //console.log('ids:' + ids);
	    this.tmp.ids = ids.reverse();
	},
	name:function(v){
	    //console.log('name:' + v);
	    this._stack.push(v + "");
	},
	value:function(v){
	    //console.log('value:' + v);
	    this._stack.push(v + "");
	},
	attr:function(v){
	    //console.log('attr:' + v);
	    var v = this._stack.pop();
	    var n = this._stack.pop();
	    this._stack.push({'name':n,'value':v});
	},
	block:function(v){
	    //console.log(' block:[' + v + ']');
	    var attrs = [];
	    while(this._stack.length != 0){
		attrs.push(this._stack.pop());
	    }
	    this.tmp.attrs = attrs.reverse();
	    this.out.push(this.tmp);
	    this.tmp = {};
	}
    };
};

CSSC.prototype = {
    parse:function(s){
	this.calcAction._stack = [];
	this.calcAction.out = [];
        this.parser.parse(s, this.calcAction)
	return this.calcAction.out;
    }
}