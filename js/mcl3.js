// Magical circle language
var MCL = function(){
    //==============================
    //   Parser
    //==============================
    this.parser = new Gin.Grammar({
	    Cmp: / Expr ([<] Expr:gt | [>] Expr:lt)* /,
	    Expr: / Term ([+] Term:add | [-] Term:sub)* /,
	    Term: / Fctr ([*] Fctr:mul | [/] Fctr:div | [%] Fctr:mod)* /,
	    //	    Fctr: / $DECIMAL:push | "$" $UINT:pushd | ARG:varBegin (("(" ARGLIST{0,1} ")" | (ARGLIST{0,1})){1}):funcArg | $JS_STRING:push | [(] Cmp:pushn [)] /,
	    Fctr: / $DECIMAL:push | "$" $UINT:pushd | ARG:varBegin (("(" ARGLIST{0,1} ")"){0,1}):funcArg | $JS_STRING:push | [(] Cmp:pushn [)] /,

	    PROGRAM: /((LINE:line <\n>)*)/,
	    LINE: /INDENT IND Cmp{0,1} COMM/,
	    COMM: /<(\/\/[^\n]*|)>/,
	    ARGLIST: /Cmp:arg (',' ARGLIST){0,1}/,
	    ARG: /<[a-zA-Z]+>/,
	    INDENT: /<:*>:indent/,
	    IND: /('>'{0,1}):ind/
	},"PROGRAM",  new Gin.Parser.RegExp(/[ ]/));
    this.calcAction = {
	_stack: [],
	argList:[],
	varList:[],
	out:[],
	push: function (v) { this._stack.push(v + ""); },
	pushn: function (v) {  },
	//pushv: function (v) { this._stack.push(["var",v + ""]); },
	pushd: function (v) {this._stack.push(["dol",v + ""]); },
	varBegin:function(v){
	    this.argList.push([]);
	    this.varList.push("" + v[0]);
	},
	funcArg: function(v){
	    var l = this.argList.pop();
	    if(v.length == 0){
		this._stack.push(["var",this.varList.pop()]);
	    }else{
		this._stack.push(["func",this.varList.pop(),l]);
	    }
	},
	pop: function () { return this._stack.pop(); },
	lt: function (v) { this._stack.push(["lt",this._stack.pop(),this._stack.pop()]);},
	gt: function (v) { this._stack.push(["gt",this._stack.pop(),this._stack.pop()]);},
	add: function (v) { this._stack.push(["add",this._stack.pop(),this._stack.pop()]);},
	sub: function (v) { this._stack.push(["sub",this._stack.pop(),this._stack.pop()]); },
	mul: function (v) { this._stack.push(["mul",this._stack.pop(),this._stack.pop()]); },
	div: function (v) { this._stack.push(["div",this._stack.pop(),this._stack.pop()]); },
	mod: function (v) { this._stack.push(["mod",this._stack.pop(),this._stack.pop()]); },
	//    dol: function (v) { this._stack.push(["dol",this._stack.pop(),this._stack.pop()]); },
	line: function(v){
	    this.out.push({
		    'indent': this.indentLevel,
		    'ind': this.indf,
		    'body': this._stack.pop()
		});
	    this.argList = [];
	},
	ind:function(v){
	    if(v.length==0){
		this.indf = false;
	    }else{
		this.indf = true;
	    }
	},
	func: function(v){this.funcName = ""+v[0]},
	arg:function(v){
	    this.argList[this.argList.length - 1].push(this._stack.pop());
	},
	indent:function(v){this.indentLevel = v.length}
    };
    this.mt = new MersenneTwister(0);
    this.globalTimer = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.sources = {};
    this.userFuncs = {};
    this.recreateFlag = false;
};

MCL.prototype = {
    parse:function(s){
	return  this.parser.parse(this.preProcess(s), this.calcAction)
    },
    preProcess:function(s){
	s = s + "\n";
	s = s.replace(/^[ ]+/mg,function(m){return new Array(m.length + 1).join(":")});
	s = s.replace(/[\r\n]+/g,"\n");
	return s;
    },
    levelNormalize:function(){
	var calcAction = this.calcAction;
	// ###############
	// LEVEL NORMALIZE
	// ###############
    	var nowIndent = -1; // indent is real indent
	var nowLevel = 0;   // level is logical indent
	var tmp;
	var indentMap = {}; // real indent -> logical indent(level)
	var ret = [];
	var stack = [];
	var now = ["root",["rest",[]]]; // initial abstruct syntax tree
	var nnow;
	for(var i=0;i<calcAction.out.length;i++){
	    tmp = calcAction.out[i].indent;          // tmp is real indent
	    if(nowIndent < tmp){                     // in next indent
		nowLevel++;
		indentMap[tmp] = nowLevel;
		calcAction.out[i].indent = nowLevel; // override

		// push next level body
		now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
		stack.push(now);                         // save
		now = nnow;                              // now is next level body
	    }else if(nowIndent == tmp){                  // same indent
		if(calcAction.out[i].ind == false){      // ind == false,(not use '>' )
		    calcAction.out[i].indent = nowLevel; // copy prev level
		    now = stack.pop();                   // pop head
		    // push same level
		    now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
		    stack.push(now);                     // save
		    now = nnow;                          // now in next level body
		}else{                                   // ind == true (use '>' )
		    nowLevel++;                          // fake indent
		    calcAction.out[i].indent = nowLevel; // set next level
		    // push now level
		    now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
		    stack.push(now);                     // save
		    now = nnow;                          // now is next level body
		    //indentMap[tmp] = nowLevel;           // set new indent
		    //nowLevel++;                          // in next indent
		}
	    }else{                                       // nowIndent > tmp  out indent
		if(indentMap[tmp] != undefined){         // search levele
		    for(var j = 0;j <= nowLevel - indentMap[tmp]; j++){
			now = stack.pop();               // pop level diff
		    }
		    // push now level
		    now[1][1].push(nnow = [calcAction.out[i].body,["rest",[]]]);
		    stack.push(now);                     // save
		    now = nnow;                          // now is next level body
		    calcAction.out[i].indent = indentMap[tmp]; // override indent
		    nowLevel = indentMap[tmp];           // now level down
		}else{                                   // no match indent
		    console.log("error");
		}
	    }
	    nowIndent = tmp;                             // nowIndent is now real indent
	}
	while(stack.length > 0){                         // pop all and get first element
	    now = stack.pop();
	}
	return now;
    }
    ,
    toLispStyle:function(lines,m){ // lines: parsed and normalized lines,m 
	var gggc=0;
	var extArgs = [];
	var exts = [];
	var self = this;
	function toInt(s,loopCnts){
	    var tag;
	    var tmp = 0;
	    var ret = [];
	    var arg =[];
	    if(s instanceof Array){
		tag = s[0];  // first element is tag
		switch(tag){
		case "lt":
		    return (toInt(s[2],loopCnts) < toInt(s[1],loopCnts))?1:0;
		case "gt":
		    return (toInt(s[2],loopCnts) > toInt(s[1],loopCnts))?1:0;
		case "add":
		    return toInt(s[2],loopCnts) + toInt(s[1],loopCnts);
		case "sub":
		    return toInt(s[2],loopCnts) - toInt(s[1],loopCnts);
		case "mul":
		    return toInt(s[2],loopCnts) * toInt(s[1],loopCnts);
		case "div":
		    return toInt(s[2],loopCnts) / toInt(s[1],loopCnts);
		case "mod":
		    return toInt(s[2],loopCnts) % toInt(s[1],loopCnts);
		case "var":
		    if(s[1]=='t')return self.globalTimer;
		    else if(s[1]=='mx')return self.mouseX;
		    else if(s[1]=='my')return self.mouseY;

		    return 1;  // magic number
		case "dol":
		    return loopCnts[loopCnts.length - 1 - parseInt(s[1])];
		case "rest":
		    //['rest',
		    // [/*body*/
		    //  [/* elm */[/* 1st func */],['rest',/* ext args */]],
		    //  [/* elm */[/* 2nd func */],['rest',/* ext args */]],
		    //  [/* elm */[/* 3rd func */],['rest',/* ext args */]],
		    //  ...
		    //  ]
		    var prearg;
		    var store;
		    for(var i = 0; i < s[1].length;i++){ // body loop
			if(s[1][i][1][1].length != 0){ // elm[i][1][1] rest body? 
			    arg = s[1][i][1]; // ['rest', [/* here */]]
			    extArgs.push(arg); // set grobal extArgs list
			}else{extArgs.push([])} // dont have ext args /* Todo: marge then-block */
			store = toInt(s[1][i][0],loopCnts);
			if(store!=null){
			    if(store instanceof Array && store[0]=="group"){
				for(var j=0;j<store[1].length;j++)
				ret.push(store[1][j]); // eval elm[i][0], line[0]
			    }else{
				ret.push(store); // eval elm[i][0], line[0]
			    }
			}
			extArgs.pop();// unset grobal extArgs list
		    }
		    return ret;
		case "func":
		    switch(s[1]){
			// s[1] => func name, s[2] => args
		    case "def":
			// save extArgs in userFuncs 
			var name = toInt(s[2][0],loopCnts);
			var tmp = extArgs[extArgs.length - 1]; //load from global extArgs
			for(var i = 0; i< tmp.length; i ++){
			    ret.push(tmp[i]);
			}
			self.userFuncs[name] = ret; //["rest",[ret]];
			return null; // return null
		    case "ext":
			var no = toInt(s[2][0],loopCnts);
			//console.log(extArgs);
			//console.log(exts);
			//console.log("ext:"+toInt(extArgs[extArgs.length - 1]));
			var tmp = exts[1];//extArgs[extArgs.length - 2];
			if(no == -1){
			    return tmp.length;
			}
			//console.log(tmp);
			//console.log(exts);
			//console.log(tmp[1][no]);
			try{
			var tmp  = toInt(["rest",[tmp[no]]],loopCnts);
			}catch(e){
			    console.log(e);
			}
			//console.log(tmp);
			return ['group',tmp];
		    case "not":
			if((a=toInt(s[2][0],loopCnts)) != 0){
			    return 0;
			}
			return -1;
		    case "if":
			if((a=toInt(s[2][0],loopCnts)) == 0){
			    //console.log(""+extArgs);
			    var tmp = extArgs[extArgs.length - 1]; // load if block
			    //console.log("tmp:"+tmp);
			    gggc++;
			    if(gggc>30000){
				return ;
			    }
			    return ["group",toInt(tmp,loopCnts)];//[m.begin,iret];
			}
			return [];
		    case "loop":
			tmp = toInt(s[2][0],loopCnts);
			for(var i = 0; i< tmp; i ++){
			    loopCnts.push(tmp); // set global loop
			    loopCnts.push(i); // set global loop
			    //ret.push(['begin',toInt(extArgs[extArgs.length - 1],loopCnts)]);
			    ret = ret.concat(toInt(extArgs[extArgs.length - 1],loopCnts));
			    loopCnts.pop();
			    loopCnts.pop();
			}
			return ["group",ret];
		    case "include":
			tmp = toInt(s[2][0], loopCnts);
			self.sources.add(tmp);
			ret = self.sources.ms[tmp];

			if(ret){
			    // ret is mcl
			    //console.log(['group',ret]);
			    return ['group',ret];
			    //return ['group',[['drawShape',['shape','circle',1]]]];
			}
			return [];
		    case "xy":
			for(i = 0; i < s[2].length; i++){ // eval all param
			    ret.push(toInt(s[2][i], loopCnts));
			}
			return ['xy',ret];
		    case "fig":
			ret = toInt(extArgs[extArgs.length - 1],loopCnts);
			return ['fig',toInt(s[2][0],loopCnts),ret];
		    case "circle":
			for(i = 0; i < s[2].length; i++){ // eval all param
			    ret.push(toInt(s[2][i], loopCnts));
			}
			return ['drawShape',['shape','circle'].concat(ret)];
		    case "arc":
			for(i = 0; i < s[2].length; i++){ // eval all param
			    ret.push(toInt(s[2][i], loopCnts));
			}
			return ['drawShape',['shape','arc'].concat(ret)];
		    case "rect":
			for(i = 0; i < s[2].length; i++){ // eval all param
			    ret.push(toInt(s[2][i], loopCnts));
			}		    
			return ['drawShape',['shape','rect'].concat(ret)];
		    case "poly":
			for(i = 0; i < s[2].length; i++){ // eval all param
			    ret.push(toInt(s[2][i], loopCnts));
			}		    
			return ['drawShape',['shape','poly'].concat(ret)];
		    case "rand":
			return self.mt.next();//Math.random();
		    case "call":
			if(s[2][0] == "Math"){
			    tmp = Math[toInt(s[2][1], loopCnts)];
			    if(tmp != undefined){
				for(i = 2; i < s[2].length; i++){ // eval all param
				    ret.push(toInt(s[2][i], loopCnts));
				}		    
				return tmp.apply(Math,ret);
			    }else{
				return 0; // error
			    }
			}else{
			    return 0; // error
			}
		    case "choice":
			tmp = toInt(s[2][0],loopCnts);
			return toInt(s[2][1 + tmp%(s[2].length - 1)],loopCnts);
		    default:
			tmp = self.userFuncs[s[1]];
			//console.log("--@@");
			//console.log(self.sources);
			//console.log(sources);

			if(tmp == undefined){
			    for(var x in self.sources.mc){
				tmp = self.sources.mc[x].userFuncs[s[1]];
				if(tmp!=undefined){
				    break;
				}
			    }
			}
			if(tmp != undefined){ // ユーザ定義関数
			    
			    ret = [];
			    gggc++;
			    if(gggc>30000){
				return;
			    }
			    //引数を積む
			    
			    for(var i = s[2].length - 1;i >= 0; i--){
				ret.push(toInt(s[2][i],loopCnts));
			    }
			    loopCnts = loopCnts.concat(ret);
			    // Todo:extArgを積む？
			    exts = extArgs[extArgs.length-1];
			    
			    //本体呼び出し
			    var retf = kk=toInt(tmp,loopCnts);
			    retf = ["group",retf];
			    var reti = parseFloat(kk); // 値が返ってくればそれを利用
			    if(!isNaN(reti)){ // 数字
				retf = reti;
			    }else if(typeof(kk[0]) == "string"){ //文字列
				retf = kk[0];
			    }else{  //それ以外
				//if(kk[0][0] == m.begin){ // Todo:これ違うっぽい
				    //console.log("IF? STATEMENT");
				    //retf = kk[1];
				//}
			    }
			    //引数をはずす
			    for(i=0;i<s[2].length;i++){
				loopCnts.pop();
			    }
			    return retf;
			}
			if(m[s[1]] !=undefined){ // MCE内関数
			    ret = [];
			    var tmp = extArgs[extArgs.length - 1]; // extArgsフェッチ
			    for(var i = 0;i < s[2].length; i++){
				ret[i] = toInt(s[2][i],loopCnts); //引数をeval
			    }
			    if(tmp != null){
				ret.push(toInt(tmp,loopCnts)); // extArgsをeval
			    }
			    gggc++;
			    if(gggc>30000)return;
			    return [s[1]].concat(ret); // mceにそのまま送る
			}
			logp("unknown macro:" + s[1]);
		    }
		default:
		    //console.log("error:" + tag);
		    //undefined tag
		}
	    }else{ // 即値
		var r =  parseFloat(s);
		if(isNaN(r))return s; //数字以外（Todo:あるっけ？
		return r;
	    }
	} // toInt
	
	// root::body
	var out = toInt(lines[1], []);
	return out;
    }
};
mclUtil = {
    spc:function(n){
	var ret = "";
	for(var i = 0; i < n; i ++){
	    ret += " ";
	}
	return ret;
    },
    dump:function(d, indent){
	var ret = "";
	if(d instanceof Array){
	    ret += "[";
	    if(d.ruleName)ret += d.ruleName +":";
	    for(var i = 0; i < d.length; i++){
		ret += mclUtil.dump(d[i], indent + 1);
		if(i != d.length - 1)ret += ",\n" +mclUtil.spc(indent) ;
	    }
	    ret += "]";
	}else{
	    ret += "'" + d + "'";
	}
	return ret;
    },
    dump2:function(d, indent){
	var ret = "";
	if(d instanceof Array){
	    ret += "[\n" + mclUtil.spc((indent) * 2);
	    if(d.ruleName)ret += d.ruleName +":";
	    for(var i = 0; i < d.length; i++){
		ret += mclUtil.dump2(d[i], indent + 1);
		if(i != d.length - 1){
		    ret += ",";
		    ret += "\n" + mclUtil.spc((indent)*2);
		}
	    }
	    ret += "]";
	}else{
	    ret += "'" + d + "'";
	}
	return ret;
    },
    dump3:function(d, indent){
	var ret = "";
	if(d instanceof Array){
	    ret += "[\n" + mclUtil.spc((indent) * 2);
	    if(d.ruleName)ret += d.ruleName +":";
	    for(var i = 0; i < d.length; i++){
		ret += mclUtil.dump3(d[i], indent + 1);
		if(i != d.length - 1){
		    ret += ",";
		    ret += "\n" + mclUtil.spc((indent)*2);
		}
	    }
	    ret += "]";
	}else{
	    if(d instanceof Object){
		ret += "'" + '**' + "'";
	    }else{
		ret += "'" + d + "'";
	    }
	}
	return ret;
    }
};


function Sources(){
    this.cache = "";
    this.sources=[];
    this.ms = {};
    this.mc = {};
    this.prefix = "";
}
Sources.prototype={
    add:function(s){
	for(var i=0;i<this.sources.length;i++){
	    if(this.sources[i] == s)return;
	}
	this.sources.push(s);
	this.load();
    },
    load:function(){
	var s = this.sources.join("\n");
	if(this.cache == s)return;
	this.cache = s;
	var self= this;
	var m = new M();
	for(var i=0;i<this.sources.length;i++){
	    this.loadAjax(this.prefix + encodeURIComponent(self.sources[i]),function(i){return function(flg,body){
		    var mcl;
		    var out;
		    if(flg){
			mcl = new MCL();
			mcl.sources = sources;
			mcl.parser.parse(mcl.preProcess(body),mcl.calcAction);
			out = mcl.levelNormalize();
			//console.log(out);
			try{
			    out = mcl.toLispStyle(out,m);
			}catch(e){
			    console.log(e);
			}
			self.ms[self.sources[i]] = out;
			self.mc[self.sources[i]] = mcl;
		    }
		    }}(i));
	}
    },
    loadAjax:function (title,f){
	
	$.ajax({
		type:"GET",
		url: title,
		cache:false,
		success:function(html){
		    //success
		    var parser = new DOMParser();
		    var xml = parser.parseFromString(html, "text/xml");
		    var body = xml.getElementsByTagName("pre")[0].firstChild.nodeValue;
		    logp("load "+title);
		    f(true,body);
		},
		error:function(){
		    //error
		    logp("error "+title);
		    f(false);
		}
	    });
	
    }
    
}
