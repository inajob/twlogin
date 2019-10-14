function M(ctx,x,y,r){
    this.ctx = ctx;
    this.r = r;
    this.rstack = [];
    this.w = 1; // linewidth
    //M.prototype.shift.apply(this,[x*r,y*r])();
    this.ctx.fillStyle="rgba(0,0,0,0)";
    this.ctx.lineWidth="1";
    this.debug = false;
    this.ctx.shadowColor="black";
    this.ctx.miterLimit = 2.8;
    //this.ctx.lineJoin="bebel";
}
M.prototype = {
    // ---- Ext canvas
    strokeEllipse:function(ctx,left, top, right, bottom) {
	var halfWidth = (right - left) / 2.0;
	var halfHeight = (bottom - top) / 2.0;
	var x0 = left + halfWidth;
	var y1 = top + halfHeight;
	ctx.beginPath();
	var cw = 4.0 * (Math.sqrt(2.0) - 1.0) * halfWidth / 3.0;
	var ch = 4.0 * (Math.sqrt(2.0) - 1.0) * halfHeight / 3.0;
	ctx.moveTo(x0, top);
	ctx.bezierCurveTo(x0 + cw, top, right, y1 - ch, right, y1);
	ctx.bezierCurveTo(right, y1 + ch, x0 + cw, bottom, x0, bottom);
	ctx.bezierCurveTo(x0 - cw, bottom, left, y1 + ch, left, y1);
	ctx.bezierCurveTo(left, y1 - ch, x0 - cw, top, x0, top);
	ctx.stroke();
    },
    // ---- primitive shape -------
    /*
    circle:function(rs){
	if(rs==undefined)rs = 1;
	return ['shape','circle',rs]
    },
    rect:function(rs){
	if(rs==undefined)rs = 1;
	return ['shape','rect',rs]
    },
    */
    poly:function(n, s, x, y, w, h){
	this.ctx.beginPath();
	this.ctx.moveTo(this.r/2*(x + w*Math.cos(0)), this.r/2*(y + h*Math.sin(0)));
	for(var i=1; i<n; i++){
	    this.ctx.lineTo(this.r/2*(x + w*Math.cos(Math.PI*2/n*(i*s%n))), this.r/2*(y + h*Math.sin(Math.PI*2/n*(i*s%n))));
	}
	this.ctx.stroke();
    },
    _fShape:function(o,fe){
	var self = this;
	f = function(){
	    var type  = o[1];
	    //var rs = o[2];
	    var len = o.length;
	    var offset = 0;
	    var x,y,w,h,n,s;
	    
	    if(type=="poly"){
		offset=2;
		n = o[2];
		s = o[3];
	    }

	    switch(len - offset){
	    case 3: // shape,type,rs
	    x = 0;
	    y = 0;
	    w = o[2 + offset];
	    h = o[2 + offset];
	    break;
	    case 4: // shape,type,rx,ry
	    x = 0;
	    y = 0;
	    w = o[2 + offset];
	    h = o[3 + offset];
	    break;
	    case 5: // shape,type,x,y,r
	    x = o[2 + offset];
	    y = o[3 + offset];
	    w = o[4 + offset];
	    h = o[4 + offset];
	    break;
	    case 6: // chape,type,x,y,w,h
	    x = o[2 + offset];
	    y = o[3 + offset];
	    w = o[4 + offset];
	    h = o[5 + offset];
	    break;
	    }
	    //console.log(len,x,y,w,h);
	    switch(type){
	    case 'rect':
	    self.ctx.rect(self.r * (x - w/2), self.r * (y - h/2), self.r * w, self.r * h);
	    break;
	    case 'circle':
	    self.strokeEllipse(self.ctx, self.r * (x - w/2), self.r * (y - h/2), self.r * (x + w / 2), self.r * (y + h / 2));
	    break;
	    case 'poly':
	    self.poly(n, s, x, y, w, h);
	    break;
	    default:
	    console.log("unknown shape");
	    }
	}
	this.ctx.beginPath();
	f();
	this.ctx.closePath();
	//this.ctx.fill();
	fe();
    },
    drawShape:function(o){
	var self = this;
	this._fShape(o,function(){self.ctx.fill();})
	this._fShape(o,function(){self.ctx.stroke();})
	return this;
    },
    clip:function(shape,ar){
	var self = this;
	this.save(function(){
		//console.log("clip",shape);
		self._fShape(shape,function(){self.ctx.clip();});
		self.begin(ar);
	    });
	return this;
    },

    line:function(){
	this.rline(1,0,0,0);
	return this;
    },
    rline:function(r1,t1,r2,t2){
	this.ctx.beginPath();
	this.ctx.moveTo(Math.cos(Math.PI*2 * t1)*r1*this.r/2,Math.sin(Math.PI*2 * t1)*r1*this.r/2);
	this.ctx.lineTo(Math.cos(Math.PI*2 * t2)*r2*this.r/2,Math.sin(Math.PI*2 * t2)*r2*this.r/2);
	this.ctx.stroke();
	return this;
    },
    text:function(s){
	this.ctx.font = (this.r)+"px ''";
	var m = this.ctx.measureText(s);
	//this.ctx.fillStyle = "black";
	this.ctx.fillText(s,-m.width/2,0);
	this.ctx.beginPath();
	this.ctx.strokeText(s,-m.width/2,0);

	return this;
    },
    //==============================================
    //-----------------------------------------------
    dbl:function(w1, w2, ar){
	console.log("dbl",w1,w2)
	this.lw(w1, ar);
	//this.ss('red', [this.lw, w2, ar]);
	
	//this.lw(w2, ar);
	this.ss("red",[[this.lw, w2, ar]]);
	//this.begin([this.ss,"white",
	//[[this.lw, w2, ar]]
	//	    ]);
	return this;
    },
    //-----------------------------------------------
    gco:function(option,ar){ // stroke style
	var self = this;
	this.save(function(){
		self.ctx.globalCompositeOperation = option;
		self.begin(ar);
	    });
    },
    lw:function(w,ar){
	var save = this.ctx.lineWidth;
	this.ctx.lineWidth = w * this.r / 100;
	this.w = w;
	this.begin(ar);
	this.ctx.lineWidth = save;
    },
    ss:function(s,ar){ // stroke style
	var save = this.ctx.strokeStyle;
	this.ctx.strokeStyle = s;
	this.begin(ar);
	this.ctx.strokeStyle = save;
    },
    fs:function(s,ar){ // fill style
	var save = this.ctx.fillStyle;
	this.ctx.fillStyle = s;
	this.begin(ar);
	this.ctx.fillStyle = save;
    },
    blur:function(b,ar){ // blur
	var save = this.ctx.shadowBlur;
	this.ctx.shadowBlur = b;
	this.begin(ar);
	this.ctx.shadowBlur = save;
    },
    save:function(f){
	this.ctx.save();
	this.rstack.push(this.r);
	try{
	    f.apply(this);
	}catch(e){
	}
	
	this.ctx.restore();
	this.r = this.rstack.pop();
	return this;
    },
    //------------------------------
    shift:function(x,y,ar){
	var self = this;
	self.save(function(){
		self.ctx.translate(x * self.r, y * self.r);
		self.begin(ar);
	    });
	return self;
    },
    rotate:function(t,ar){
	var self = this;
	self.save(function(){
		self.ctx.rotate(t * Math.PI*2);
		self.begin(ar);
	    });
	return self;
    },
    scale:function(s,ar){
	var self = this;
	self.save(function(){
		this.r = this.r*s;
		self.begin(ar);
	    });
	return self;
    },
    half:function(ar){
	return this.scale(1/2,ar);
    },
    //------------------------------
    prog:function(ar){
	var i;
	if(ar==undefined)return this;
	if(!(ar instanceof Array)){
	    ar = [ar];
	}
	for(i=0;i<ar.length;i++){
	    ar[i].apply(this);
	}
	return this;
    },
    begin:function(ar){
	var i,j;
	var f;
	var arg;
	var tmp;
	var self = this;
	if(ar == undefined){
	    return this;
	}
	for(i = 0; i < ar.length; i++){
	    if(ar[i] == null)continue;
	    f = ar[i][0];
	    if(ar[i][0] == "shape"){
		var self = this;
		//console.log("shape");
		//console.log(f);
		f = function(){
		    self.drawShape(ar[i]);
		    return self;
		}
	    }

	    arg = [];
	    for(j = 1; j < ar[i].length; j++){
		tmp = ar[i];
		//if(tmp instanceof Array){
		//    tmp = this.begin(tmp);
		//}
		arg.push(ar[i][j]);
	    }
	    //console.log("func apply");
	    //console.log(f);
	    try{
		tmp = f.apply(this, arg);
	    /*
	    switch(f){
	    case this.rotate:
		//case this.scale:
	    case this.shift:
		this.save(function(){
			self.lineWidth = 0.1;
			self.ctx.strokeStyle="green";
			self.ctx.fillStyle="transparent";
			self.drawShape(["shape","rect",1]);
		    });
	    }
	    */
	    }catch(e){
		//console.log(e);
		//console.log(e.stack);
	    }
	    
	}
	return this;
    }/*,
    loop:function(n,ar){
	var i = 0;
	var objs = [];
	for(i = 0;i < n; i++){
	    objs.push(ar);
	}
	return objs;
	}*/
}

//==============================
//   Parser
//==============================
    var parser = new Gin.Grammar({
	    Cmp: / Expr ([<] Expr:gt | [>] Expr:lt)* /,
	    Expr: / Term ([+] Term:add | [-] Term:sub)* /,
	    Term: / Fctr ([*] Fctr:mul | [/] Fctr:div | [%] Fctr:mod)* /,
	    Fctr: / $DECIMAL:push | "$" $UINT:pushd | ARG:varBegin (("(" ARGLIST{0,1} ")" | (ARGLIST{0,1})){0,1}):funcArg | $JS_STRING:push | [(] Cmp:pushn [)] /,

	    PROGRAM: /((LINE:line)*)/,
	    LINE: /INDENT IND Cmp COMM ';'/,
	    COMM: /<(\/\/[^;]*|)>/,
	    ARGLIST: /Cmp:arg (',' ARGLIST){0,1}/,
	    ARG: /<[a-zA-Z]+>/,
	    INDENT: /<:*>:indent/,
	    IND: /('>'{0,1}):ind/,
	},"PROGRAM",  new Gin.Parser.RegExp(/[\s]/));

var calcAction = {
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
/*
function test(m){
    var pp = parser.parse(preProcess('  scale 0.5\n   circle 1/4\n   circle 1/2\n   loop 5\n    rotate $0/32\n     rect 1\n'), calcAction);
    var out = levelNormalize(calcAction);
    var ret = toLispStyle(out,m);
    return ret;
}
*/
function preProcess(s){
    s = s + "\n";
    s = s.replace(/^[ ]+/mg,function(m){return new Array(m.length + 1).join(":")});
    s = s.replace(/[\r\n]+/g,";");
    return s;
}

function levelNormalize(action){
    // ###############
    // LEVEL NORMALIZE
    // ###############
    
    var nowIndent = -1;
    var nowLevel = 0;
    var tmp;
    var tmp2 = {};
    var ret = [];

    var stack = [];
    var now = ["root",["rest",[]]];
    var nnow;
    for(var i=0;i<calcAction.out.length;i++){
	tmp = calcAction.out[i].indent;    
	if(nowIndent < tmp){
	    //console.log("in");
	    nowLevel++;
	    tmp2[tmp] = nowLevel;
	    calcAction.out[i].indent = nowLevel;

	    now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
	    stack.push(now);
	    now = nnow;
	}else if(nowIndent == tmp){
	    //console.log("same");
	    if(calcAction.out[i].ind == false){
		calcAction.out[i].indent = nowLevel;
		
		now = stack.pop();
		now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
		stack.push(now);
		now = nnow;
	    }else{
		nowLevel++;
		calcAction.out[i].indent = nowLevel;
		
		now[1][1].push(nnow = [calcAction.out[i].body, ["rest",[]]]);
		stack.push(now);
		now = nnow;
		tmp2[tmp] = nowLevel;
		nowLevel++;
		
	    }
	}else{ // nowIndent > tmp
	    //console.log("out");
	    if(tmp2[tmp] != undefined){
		for(var j = 0;j <= nowLevel - tmp2[tmp]; j++){
		    now = stack.pop();
		}
		now[1][1].push(nnow = [calcAction.out[i].body,["rest",[]]]);
		stack.push(now);
		now = nnow;
		
		calcAction.out[i].indent = tmp2[tmp];
		nowLevel = tmp2[tmp];
	    }else{
		// else
		console.log("error");
	    }
	}
	nowIndent = tmp;
    }

    while(stack.length > 0){
	now = stack.pop();
    }
    //console.log(now);

    //return calcAction.out;
    return now;
}

var userFuncs = {};
var extArgs=[];

var mt = new MersenneTwister();

function toLispStyle(lines,m){
    // ###############
    // TRANSFORM LISP STYLE
    // ###############
    function toInt(s,loopCnts){
	var tag;
	var tmp = 0;
	var ret = [];
	var arg =[];
	if(s instanceof Array){
	    tag = s[0];
	    //console.log(tag);
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
		///console.log(s + "::"+globalTimer);
		if(s[1]=='t')return globalTimer;
		return 1;  // magic number
	    case "dol":
		return loopCnts[loopCnts.length - 1 - parseInt(s[1])];
	    case "rest":
		//console.log("REST")
		//console.log(s);
		if(s[1].length != 1 || true){
		    ret = [];
		    //console.log("rest g" + s[1].length)
		    //console.log("aaa")
		    //console.log(s);

		    var prearg;
		    //console.log("rest")
		    var store;
		    for(var i = 0; i < s[1].length;i++){
			//console.log("TEST")
			//console.log(s[1][i])
			//console.log(s[1][i][1])
			//console.log(s[1][i][1].length)
			if(s[1][i][1][1].length != 0){
			    arg = s[1][i][1];
			    //console.log(arg);
			    //if(arg.length != 0){
				//console.log("arg")
				//   console.log(arg);
				//s[1][i][0][2].push(arg);
				extArgs.push(arg);
				//}
			    //console.log(s[1][i][0][2])
			}else{extArgs.push([])}
			ret.push(store = toInt(s[1][i][0],loopCnts));
			//if(s[1][i][1][1].length != 0){
			    //s[1][i][0][2].pop();
			    extArgs.pop();
			    //}
		    }
		    return ret;
		}else{
		    // BUGGGG
		    //console.log("last rest");
		    //console.log(s[1][0]);
		    tmp = s[1][0][0];
		    tmp[2].push(s[1][0][1]);
		    return [toInt(tmp,loopCnts)];
		}
	    case "func":
		switch(s[1]){
		    
		case "def":
		    var name = toInt(s[2][0],loopCnts);
		    ret = [];
		    //console.log("def");
		    //console.log(s);
		    var tmp = extArgs[extArgs.length - 1];
		    for(var i = 0; i< tmp.length; i ++){
			//ret.push(toInt(s[2][1][i],loopCnts)[0]);
			//console.log(s[2][1][i]);
			ret.push(tmp[i]);
		    }
		    //console.log("ret");
		    //console.log(ret);
		    userFuncs[name] = ret;//["rest",[ret]];
		    //console.log(ret);
		    //return [m.begin,ret];
		    return null;
		case "not":
		    if((a=toInt(s[2][0],loopCnts)) != 0){
			//console.log("NOT"+a)
			return 0;
		    }
		    return -1;
		case "if":
		    if((a=toInt(s[2][0],loopCnts)) == 0){
			//console.log("if true" + a);
			var iret = [];
			//console.log(s[2]);
			var tmp = extArgs[extArgs.length - 1];
			//console.log("TMP")
			//    console.log(tmp);
			//for(var iif = 0; iif< tmp.length; iif ++){
			//    iret.push([m.begin,toInt(tmp[iif],loopCnts)]);
			//}
			//console.log(s[2].length+"E")
			gggc++;
			if(gggc>30000)return ;
			//console.log("==if==");
			//console.log(iret);
			//console.log([m.begin,s[2].slice(1)[0]]);
			//console.log(s[2]);
			return [m.begin,toInt(tmp,loopCnts)];//[m.begin,iret];
		    }
		    return [m.begin,[]];
		case "loop":
		    //console.log("LOOP");
		    tmp = toInt(s[2][0],loopCnts);
		    //console.log(s);
		    //console.log(tmp);
		    ret = [];
		    
		    for(var i = 0; i< tmp; i ++){
			loopCnts.push(i);
			
			//ret.push(toInt(s[2][1],loopCnts)[0]);
			ret.push([m.begin,toInt(extArgs[extArgs.length - 1],loopCnts)]);
			loopCnts.pop();
		    }
		    
		    //console.log(ret);
		    return [m.begin,ret];
		case "circle":
		    ret = [];
		    for(i = 0; i < s[2].length; i++){
			ret.push(toInt(s[2][i], loopCnts));
		    }
		    return ['shape','circle'].concat(ret);
		case "rect":
		    ret = [];
		    for(i = 0; i < s[2].length; i++){
			ret.push(toInt(s[2][i], loopCnts));
		    }		    
		    return ['shape','rect'].concat(ret);
		case "poly":
		    ret = [];
		    for(i = 0; i < s[2].length; i++){
			ret.push(toInt(s[2][i], loopCnts));
		    }		    
		    return ['shape','poly'].concat(ret);
		case "rand":
		    return mt.next();//Math.random();
		case "sqrt":
			return Math.sqrt(parseFloat(s[2][0]))
		case "rgb":
		    return "rgb("+ toInt(s[2][0],loopCnts) + "," + toInt(s[2][1],loopCnts) +","+ toInt(s[2][2],loopCnts) + ")";
		case "rgba":
		    return "rgba("+ toInt(s[2][0],loopCnts) + "," + toInt(s[2][1],loopCnts) +","+ toInt(s[2][2],loopCnts) +","+ toInt(s[2][3],loopCnts) + ")";
		case "choice":
		    tmp = toInt(s[2][0],loopCnts);
		    return toInt(s[2][1 + tmp%(s[2].length - 1)],loopCnts);
		case "floor":
		    return Math.floor(toInt(s[2][0],loopCnts));
		default:
		    if(userFuncs[s[1]] != undefined){
			ret = [];
			gggc++;
			if(gggc>30000){
			    //console.log("OUT");
			    return;
			}
			//引数を積む
			for(var i = 0;i < s[2].length; i++){
			    ret[i] = toInt(s[2][i],loopCnts);
			    loopCnts.push(ret[i]);
			}
			//console.log(userFuncs[s[1]]);
			//console.log(toInt(userFuncs[s[1]],loopCnts));
			//var kk;
			//本体呼び出し
			var retf = [m.begin,kk=toInt(userFuncs[s[1]],loopCnts)];
			//console.log(kk);
			//console.log("func ret ::"+kk + "::" + parseFloat(kk));
			var reti = parseFloat(kk); // 値が返ってくればそれを利用
			if(!isNaN(reti)){
			    //console.log(reti);
			    retf = reti;
			}else if(typeof(kk[0]) == "string"){
			    retf = kk[0];
			}else{
			    //console.log(kk[0][0],kk[1]);
			    if(kk[0][0] == m.begin){
				//console.log("IF? STATEMENT");
				retf = kk[1];
			    }
			}
			//console.log(retf);
			//引数をはずす
			for(i=0;i<s[2].length;i++){
			    loopCnts.pop();
			}
			return retf;

		    }
		    if(m[s[1]] !=undefined){ // FUNCTION
			ret = [];
			var tmp = extArgs[extArgs.length - 1];
			//console.log("user");
			//console.log("s[1]"+ s[1])
			//console.log(tmp);
			//console.log(s);
			for(var i = 0;i < s[2].length; i++){
			    ret[i] = toInt(s[2][i],loopCnts);
			    //console.log(ret[i]);
			}

			if(tmp != null){
			    ret.push(toInt(tmp,loopCnts));
			}
			//console.log("ret");
			//console.log(ret);
			
			gggc++;
			if(gggc>30000)return;
			return [m[s[1]]].concat(ret);
			//return [m[s[1]],ret,ret2];
		    }
		    console.log("unknown macro:" + s[1]);
		}
	    default:
		//console.log("error:" + tag);
	    }
	}else{
	    var r =  parseFloat(s);
	    if(isNaN(r))return s;
	    return r;
	}
    }
    var out = toInt(lines[1], []);
    //console.log(out);
    return out;
}
var gggc=0;

//==============================

var globalTimer = 0;

$(function(){
	// initialize code
	var canv = document.getElementById('canv');
	// ---------------
	var draw = function(){
	    mt = new MersenneTwister(2);
		var ctx = canv.getContext("2d");
		ctx.clearRect(0,0,400,400);
		ctx.save();
		ctx.translate(200,200);

		var m = new M(ctx,0,0,200);
		var val = $('#src').val();
		calcAction.out = [];
		var pp = parser.parse(preProcess(val), calcAction);
		//console.log(pp);
		var out = levelNormalize(calcAction);
		//console.log(out);
		gggc = 0;
		var ret = toLispStyle(out,m);
	    //console.log("lisp")
	    
		with(m){
		    begin(ret);
		}
		ctx.restore();
	}
	
	var play = function(){
		if(timer!=null){
		    clearInterval(timer);
		    globalTimer = 0;
		    timer = null;
		    return;
		}
		
		timer = setInterval(function(){
			try{
			    draw();
			    globalTimer++;
			}catch(e){
			    console.log(e);
			}
		    },50);
	}
	
	$('#drawbtn').bind('click',function(e){
		draw();
	    });
	var timer = null;
	$('#playbtn').bind('click',function(e){
		play();
	    });

	$('#src').bind('keydown',function(e){
		if(e.which == 115){
		    draw();
		    return false;
		}else if(e.witch == 114){
		    play();
		    return false;
		}
		//console.log(e.which)
	});
});