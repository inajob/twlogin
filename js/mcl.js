// MCE Language
// Ver2

var MCL = function(){
    //==============================
    //   Parser
    //==============================
    this.parser = new Gin.Grammar({
	    Stmnt: /Cmp:cmp | [!] ARG:push [=] Cmp:assign/,  // 代入演算、即値
	    Cmp: / Expr ([<] Expr:gt | [>] Expr:lt | [==] Expr:eq | [!=] Expr:neq)* /,      // 比較演算
	    Expr: / Term ([+] Term:add | [-] Term:sub)* /,   // 加減演算
	    Term: / Fctr ([*] Fctr:mul | [/] Fctr:div | [%] Fctr:mod)* /, // 乗除演算
            // 数字、変数、関数、文字列、括弧
	    Fctr: / $DECIMAL:fpush | Def | Call | $JS_STRING:push | [(] Cmp:pushn [)] /,
            Call: /(ARG:vpush|[(] Cmp[)]):callBegin (("(" ARGLIST{0,1} ")":prepareBlock (("{" PROGRAM "}"){0,1}):funcBody) {0,1}):funcCall/,
            Def: /[\\]:defBegin ("(" ARGLIST{0,1} ")":prepareBlock "{" PROGRAM "}":funcBody):funcDef/,

            // プログラム全行
	    PROGRAM: /((LINE:line (<;>){0,1})*)/,
	    LINE: /Stmnt COMM/, //ブロック解析
	    COMM: /<(\/\/[^\r\n]*|)>/,            //コメント
	    ARGLIST: /Stmnt:arg (',' ARGLIST){0,1}/, // 引数リスト
	    ARG: /<[a-zA-Z][a-zA-Z0-9]*>/,      //識別子
	},"PROGRAM",  new Gin.Parser.RegExp(/[ \r\n]/));
    this.calcAction = {
	_stack: [],
	argList:[],
	varList:[],
	block:[[]],
        out:[],
	push: function (v) { this._stack.push(["imm", v + ""]); }, // 即値
	fpush: function (v) { this._stack.push(["imm", parseFloat(v + "")]); }, // 即値(数字）
	vpush: function (v) { this._stack.push(["variable", (v + "")]); }, // 変数
	pushn: function (v) {  }, //何もしない
	callBegin:function(v){ // 識別子オブジェクトを作成
	    this.argList.push([]);
	    //this.varList.push("" + v[0]);
            this.varList.push(this._stack.pop());
	},
	defBegin:function(v){ // 識別子オブジェクトを作成
	    this.argList.push([]);
	},
	funcCall: function(v){ // 識別子オブジェクトに 引数リストオブジェクトを突っ込む
	    var l = this.argList.pop();
	    if(v.length == 0){  // 引数がない場合は変数
		this._stack.push(this.varList.pop());
	    }else{              // 引数がある場合は関数呼び出し
                var b = this._stack.pop();
                if(b == null){
                    this._stack.push(["func",this.varList.pop(),l,[]]);
                }else{
                    this._stack.push(["func",this.varList.pop(),l,b]);
                }
	    }
	},
	funcDef: function(v){ // 識別子オブジェクトに 引数リストオブジェクトを突っ込む
	    var l = this.argList.pop();
	    //if(v.length == 0){  // 引数がない場合は変数
            //this._stack.push(["variable",this.varList.pop()]);
	    //}else{              // 引数がある場合は関数呼び出し
                var b = this._stack.pop();
                if(b == null){
                    this._stack.push(["def",l,[]]);
                }else{
                    this._stack.push(["def",l,b]);
                }
	    //}
	},
        prepareBlock:function(v){ // blockを格納するために処理
            this.block.push([]);
        },
	funcBody: function(v){ // 識別子オブジェクトに 関数ボディオブジェクトを突っ込む
	    if(v.length == 0){  // 引数がない場合は変数
                this._stack.push(null);
                this.block.pop();
	    }else{              // 引数がある場合は関数呼び出し
                this._stack.push(this.block.pop());
	    }
	},
	assign:function(v){ // 左辺値と 右辺値を取り出して 代入オブジェクトを作成
	    var cmp = this._stack.pop();
	    var vs = this._stack.pop();
	    this._stack.push(["assign",vs,cmp]);
	},
	cmp:function(v){ // 即値がいきなり来た場合
	    var a = this._stack[this._stack.length - 1];
	},
        // 行オブジェクトの作成
	line: function(v){
            var tmp = this._stack.pop();
	    this.block[this.block.length - 1].push(tmp);
	    //this.argList = [];
	},
        // 引数リストの追加
	arg:function(v){
	    this.argList[this.argList.length - 1].push(this._stack.pop());
	},
        // 二項演算オブジェクトの作成
	neq: function (v) {var r = this._stack.pop(), l = this._stack.pop(); this._stack.push(["neq",l,r]);},
	eq: function (v) {var r = this._stack.pop(), l = this._stack.pop(); this._stack.push(["eq",l,r]);},
	lt: function (v) {var r = this._stack.pop(), l = this._stack.pop(); this._stack.push(["lt",l,r]);},
	gt: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["gt",l,r]);},
	add: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["add",l,r]);},
	sub: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["sub",l,r]); },
	mul: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["mul",l,r]); },
	div: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["div",l,r]); },
	mod: function (v) {var r = this._stack.pop(), l = this._stack.pop();  this._stack.push(["mod",l,r]); },

    };
};
MCL.prototype = {
    preProcess:function(s){
        // プリプロセッサ
        var l = s.split(/[\r\n]+/);
        var i, j;
        var count = 0;
        var stack = [0];
        var pre = 0;
        var out = "";
        for(i = 0; i < l.length; i ++){
	    // 行頭コメントはここで消す
	    l[i] = l[i].replace(/^\s*\/\/.*$/,"");
	    if(l[i].length == 0)continue;
            count = 0;
            for(j = 0; j < l[i].length; j ++){
                if(l[i][j] == ' '){
                    count ++;
                }else{
                    break;
                }
            }
            pre = stack[stack.length - 1];
            if(pre == count){  // same indent
                // nothing to do
                out += l[i] + '\n';
            }else{ // different indent
                if(pre < count){ // in block
                    out += '{\n' + l[i] + '\n';
                    stack.push(count);
                }else{  // out block
                    while(stack.length > 0){
                        stack.pop();
                        out += '}\n';
                        if(stack[stack.length - 1] == count){
                            break;
                        }
                    }
                    out += l[i] + '\n';
                }
            }
        }
        for(i = 0; i < stack.length - 1; i ++){
            out += '}';
        }
        return out;
    },
    parse:function(s){
        this.calcAction.block = [[]];
	this.rawOut = this.parser.parse(s, this.calcAction)

        if(this.rawOut.full == false){
	  var ss = "";
	  for(var x in this.rawOut){
            ss += x + ":" + this.rawOut[x] + "\n";
	  }
	  throw "syntax error before " +  "[" + s.slice(this.rawOut.lastIndex) + "]";
	}
	//console.log("src "+s)
	//console.log(this.rawOut)
        return this.calcAction.block;
    }
};

    function Affine(){
	this.data=[[1,0,0],[0,1,0],[0,0,1]];
	if(arguments.length == 9){
	    this.data = [
			 [arguments[0],arguments[1],arguments[2]],
			 [arguments[3],arguments[4],arguments[5]],
			 [arguments[6],arguments[7],arguments[8]]
			 ];
	}else if(arguments.length == 0){
	}else{
	    throw "arguments size error";
	}
    }

// スコープを表現
Scope = function(){
  this.body = {};
  this.next = null;
}

MCE = function(){
    this.mt = new MersenneTwister(0);
    this.date = new Date();
    this.stack = []; // 変数リスト
    this.scope = null; // 変数リスト
    this.externalVar = {}; // 外部変数
    this.externalVarRequest = {}; // 外部変数要求
    this.description = "";
    this.out = "";
};
MCE.prototype = {
    // 新しい変数のスコープを作成
    createScope:function(){
        this.stack.push({});

        var prevScope = this.scope;
        this.scope = new Scope();
        this.scope.next = prevScope;
    },
    destroyScope:function(){
        this.stack.pop();
        if(this.scope == null){
          throw "error no more scope";
        }
        this.scope = this.scope.next;
    },
    // 今のスタックに　名前、　値を紐付ける
    bindVariable: function(name, value){
      this.stack[this.stack.length - 1][name] = value;

      this.scope.body[name] = value;
    },
    // スタックをあがっていってその名前の変数があれば値を紐付ける
    // どこにも無い場合はグローバルに紐付ける
    setVariable:function(name, value){
        var t = this.scope;
        while(t){
          if(t.body[name] !== undefined){
            t.body[name] = value;
            break;
          }
          t = t.next;
        }
        if(!t){
          // todo: どこにもない場合はローカルにしてみる？
          this.scope.body[name] = value;
        }

        for(var i = this.stack.length - 1; i >= 0; i --){
            if(this.stack[i][name] !== undefined){
                this.stack[i][name] = value;
                return;
            }
        }
        this.stack[this.stack.length - 1][name] = value;
    },
    // 変数の値の解決
    getVariable:function(name){
        var t = this.scope;
        while(t){
          if(t.body[name] !== undefined){
            return t.body[name];
            break;
          }
          t = t.next;
        }
        if(t == null){
          // todo: どこにもない場合はローカルにしてみる？
          return undefined;
        }


        for(var i = this.stack.length - 1; i >= 0; i --){
            if(this.stack[i][name] !== undefined){
                return this.stack[i][name];
            }
        }
        return undefined;
    },
    run:function(obj){
        this.out = "";
        //this.stack = [];
        this.extArgs = [];
        this.createScope();
        //                     ID        仮引数              処理本体 識別子
        this.setVariable('if',['builtin',[['variable','cond']],[],'if']);
        this.setVariable('blockif',['builtin',[['variable','cond']],[],'blockif']);
        this.setVariable('not',['builtin',[['variable','target']],[],'not']);
        this.setVariable('loop',['builtin',[['variable','max']],[],'loop']);
        this.setVariable('write',['builtin',[['variable','str']],[],'write']);
        this.setVariable('getExternalVar',['builtin',[['variable','label'],['variable','initial']],[],'getExternalVar']);
        this.setVariable('addDescription',['builtin',[['variable','type'],['variable','text']],[],'addDescription']);
        this.setVariable('eval',['builtin',[['variable','class'],['variable','method']],[],'eval']);
        this.setVariable('evalAllExtArgs',['builtin',[],[],'evalAllExtArgs']);
        this.setVariable('evalExtArg',['builtin',[['variable','n']],[],'evalExtArg']);
        this.setVariable('extArgsLength',['builtin',[],[],'extArgsLength']);
        this.setVariable('block',['builtin',[],[],'block']);
        var self = this;
        this.setVariable('rand',['builtin',[],[],'js', function(){return self.mt.next()}]);
	// ==== STRING ====
        this.setVariable('stringLength',['builtin',[['variable','str']],[],'js', function(){
	  var s = self.getVariable('str');
	  var n;
	  if(s){ n = s.length; }
	  return n;
	}]);
        this.setVariable('stringCharAt',['builtin',[['variable','str'],['variable','n']],[],'js', function(){
	  return self.getVariable('str')[self.getVariable('n')];
	}]);

	// ==== DATE ====
        this.setVariable('dateGetFullYear',['builtin',[],[],'js', function(){
	  return self.date.getFullYear();
	}]);
        this.setVariable('dateGetYear',['builtin',[],[],'js', function(){
	  return self.date.getYear();
	}]);
        this.setVariable('dateGetMonth',['builtin',[],[],'js', function(){
	  return self.date.getMonth();
	}]);
        this.setVariable('dateGetDay',['builtin',[],[],'js', function(){
	  return self.date.getDay();
	}]);
        this.setVariable('dateGetHours',['builtin',[],[],'js', function(){
	  return self.date.getHours();
	}]);
        this.setVariable('dateGetMinutes',['builtin',[],[],'js', function(){
	  return self.date.getMinutes();
	}]);
        this.setVariable('dateGetSeconds',['builtin',[],[],'js', function(){
	  return self.date.getSeconds();
	}]);

        // ==== ARRAY ====
        this.setVariable('arrayInit',['builtin',[],[],'js', function(){
	  return [];
	}]);
        this.setVariable('arraySet',['builtin',[['variable','vname'],['variable','index'],['variable','target']],[],'js', function(){
	  var arr = self.getVariable('vname');
	  arr[self.getVariable('index')] = self.getVariable('target');
	  return self.getVariable('target');
	}]);
        this.setVariable('arrayGet',['builtin',[['variable','vname'],['variable','index']],[],'js', function(){
	  var arr = self.getVariable('vname');
	  return arr[self.getVariable('index')];
	}]);
        this.setVariable('arrayCount',['builtin',[['variable','vname']],[],'js', function(){
	  var arr = self.getVariable('vname');
	  return arr.length;
	}]);
        this.setVariable('arrayPop',['builtin',[['variable','vname']],[],'js', function(){
	  var arr = self.getVariable('vname');
	  return arr.pop();
	}]);
        this.setVariable('arrayPush',['builtin',[['variable','vname'],['variable','target']],[],'js', function(){
	  var arr = self.getVariable('vname');
	  arr.push(self.getVariable('target'));
	  return self.getVariable('target');
	}]);


        var ret;
        for(var i=0; i < obj.length; i ++){
            ret = this.execute(obj[i]);
        }
        this.destroyScope();
        return ret;
    },
    execute: function(obj){
        var i;
        var ret;
        for(i = 0; i < obj.length; i ++){
            if(this[obj[i][0]]){
                ret = this[obj[i][0]].apply(this,obj[i].slice(1));
            }else{
                throw "unknown op-code [" + obj[i][0] + "]";
            }
        }
        return ret; // 最後の実行結果を返す
    },
    // 関数オブジェクト
    def: function(vArgList, block){
        // ユーザ定義関数の呼び出し
        var out;
        //    ID, 仮引数, 処理本体, 環境
        out = ['lambda', vArgList, block, this.scope];
        return out;
    },
    // 関数呼び出し
    func: function(obj, argList, extArgs){
        // 組込み制御構文の処理
        var l = this.execute([obj]);
        if(l==undefined){
            throw "undefined function " +  '"' + obj[1] + '"';
        }
        var ret;

        var op = l[0];        // ID
        var vArgList = l[1];  // 仮引数
        var block = l[2];     // 処理本体

        // todo: ここでscopeを展開するのかな？ で、そこにcreateScopeすればいいのか？
        //       2回呼ばれたらダメな気がする
        //       呼び出し後に元のscopeに戻す必要がある
        //       block 実行時とextArgs実行時でスコープを変化させる？
        //       block
        //         // 
        //       extArgs
        //         //  今のscope?


        // 先に引数をどうにかする
        var tmpArgList = [];
	//console.log('==' + op + '==');
        for(var i = 0; i < argList.length; i ++){
          tmpArgList[i] = this.execute([argList[i]]);
	  //console.log(tmpArgList[i]);
        }
        var prevScope = this.scope;
        var nextScope = new Scope();

	// ユーザ定義関数は宣言されたスコープで実行する
        if(op == 'lambda'){
          nextScope.next = l[3];
          this.scope = nextScope;
        }
        //nextScope.next = this.scope;
        //this.scope = nextScope;

        //if(op == 'builtin'){}else{ 
        this.createScope();
        //}
       
        // argList : 実引数
        // vArgList: 仮引数
        // memo: 可変引数を許可
        //if(argList.length != vArgList.length){
        //    throw "arg number mismatch";
        //}
        // このときは上のスコープまで上がらない（そのスコープに無いときは作る）
        for(var i = 0; i < vArgList.length; i ++){
            if(i < argList.length){
                this.bindVariable(vArgList[i][1], tmpArgList[i]);
            }else{
                this.bindVariable(vArgList[i][1], null); // 引数が足りていないとき
            }
        }
        if(op == 'builtin'){ // builtin or lambda
            var type = l[3];
            // ビルトイン関数 （あまり増やしたくない、 なるべくpreludeにいれよう）
            if(type == 'if'){
                if(this.getVariable('cond')){ // todo: condって名前考えよう
		    var tmpScope = this.scope
		    this.scope = this.scope.next;
                    ret = this.execute(extArgs);
		    this.scope = tmpScope;
                }
            }else if(type == 'blockif'){
                if(this.getVariable('cond')){ // todo: condって名前考えよう
                    // condがみえなくする
		    var tmpScope = this.scope
		    this.scope = this.scope.next;
                    ret = this.execute([extArgs[0]]);
		    this.scope = tmpScope;
                }else{
                    // condがみえなくする
		    var tmpScope = this.scope
		    this.scope = this.scope.next;
                    ret = this.execute([extArgs[1]]);
		    this.scope = tmpScope;
		}
            }else if(type == 'not'){
                var target = this.getVariable('target');
                ret = (!target)?true:false;
            }else if(type == 'loop'){
                var max = this.getVariable('max');
                for(var i = 0; i < max; i ++){
                    // maxがみえなくする
		    var tmpScope = this.scope
		    this.scope = this.scope.next;
                    ret = this.execute(extArgs);
		    this.scope = tmpScope;
                }
            }else if(type == 'block'){
	        // letみたいな感じで変数を宣言
                for(var i = 0; i < argList.length; i ++){
		  this.bindVariable(this.execute([argList[i]]), 0);
		}
                ret = this.execute(extArgs);
            }else if(type == 'addDescription'){
                var type = this.getVariable('type');
                var text = this.getVariable('text');
		
                function escapeHTML(val) {
                  return val.replace(/<>/g);
	        };
                switch(type){
		  case 'h1':
                    this.description += '<h1>' + escapeHTML(text) + '</h1>';
		    break;
		  case 'h2':
                    this.description += '<h2>' + escapeHTML(text) + '</h2>';
		    break;
		  case 'h3':
                    this.description += '<h3>' + escapeHTML(text) + '</h3>';
		    break;

                  default:
                    this.description += escapeHTML(text) + '<br>';
                }
            }else if(type == 'getExternalVar'){
                var label = this.getVariable('label');
                var initial = this.getVariable('initial');
                
                this.externalVarRequest[label] = {label:label, initial:initial};
               
                ret = this.externalVar[label];
            }else if(type == 'write'){
                var str = this.getVariable('str');
                this.out += str + '\n';
            }else if(type == 'eval'){
                var vClass = this.getVariable('class');
                var vMethod = this.getVariable('method');
                // 可変長引数が扱いたい
                // argListを直に触ればok
                if(vClass == 'Math'){
                    var tmp = argList.slice(2);
                    // todo: この処理を何とかしたい
                    for(var i = 0; i < tmp.length; i ++){
                        tmp[i] = this.execute([tmp[i]]);
                    }
                    //throw (argList);
                    ret = Math[vMethod].apply(Math, tmp);
                }else{
                    throw "not support class :" + vClass;
                }
                
            }else if(type == 'evalAllExtArgs'){
                // targetのscopeを合わせる
                var target = this.extArgs.pop();
                // extArgsを処理するときは 上の関数のextArgsが見えるように一度popする
		var scope = this.stack.pop(); // この関数実行用の領域(この関数の引数リスト）※evalAllExtArgsは引数がないので空
		var scope2 = this.stack.pop(); // もうひとつ上の領域 evalAllExtArgsのある関数の引数リスト
		// scopeも待避させる

                var tmpScope = this.scope;
                this.scope = target.scope;

                ret = this.execute( target.body );
		this.scope = tmpScope;
		this.stack.push(scope2);
		this.stack.push(scope);
                this.extArgs.push(target);
                
            }else if(type == 'evalExtArg'){
                var n = this.getVariable('n');
                
                var target = this.extArgs.pop();
                // extArgsを処理するときは 上の関数のextArgsが見えるように一度popする
		var scope = this.stack.pop(); // この関数実行用の領域(この関数の引数リスト）※evalAllExtArgsは引数がないので空
		var scope2 = this.stack.pop(); // もうひとつ上の領域 evalAllExtArgsのある関数の引数リスト
		// scopeも待避させる

                var tmpScope = this.scope;
                this.scope = target.scope;
 
                ret = this.execute( [target.body[n]] );
		this.scope = tmpScope;

		this.stack.push(scope2);
		this.stack.push(scope);
                this.extArgs.push(target);
 
            }else if(type == 'extArgsLength'){
                var target = this.extArgs.pop();
                // extArgsを処理するときは 上の関数のextArgsが見えるように一度popする
	        ret = target.body.length;
                this.extArgs.push(target);
            }else if(type == 'js'){
                var f = l[4];
                ret = f();
            }else{
                throw "unknwon builtin :" + type;
            }
        }else{
            // ユーザ定義関数の実行
            // ここでスコープをextArgsとセットで入れておくべき
            this.extArgs.push({body:extArgs, scope:prevScope});
            ret = this.execute(block); // 再起するとここがかさみそう
            this.extArgs.pop();
        }

        //if(op == 'builtin'){}else{ 
        this.destroyScope();
        //}

        this.scope = prevScope;
 
        return ret;
    },
    imm:function(n){
        return n;
    },
    variable:function(id){
        return this.getVariable(id);
    },
    assign:function(left, right){
        //todo: left?
        return this.setVariable(this.execute([left]), this.execute([right]));
    },
    neq:  function(left, right){return this.execute([left]) != this.execute([right]);},
    eq:  function(left, right){return this.execute([left]) == this.execute([right]);},
    lt:  function(left, right){return this.execute([left]) > this.execute([right]);},
    gt:  function(left, right){return this.execute([left]) < this.execute([right]);},
    add: function(left, right){return this.execute([left]) + this.execute([right]);},
    sub: function(left, right){return this.execute([left]) - this.execute([right]);},
    mul: function(left, right){return this.execute([left]) * this.execute([right]);},
    div: function(left, right){return this.execute([left]) / this.execute([right]);},
    mod: function(left, right){return this.execute([left]) % this.execute([right]);}
};

function dump(ar,depth){
    if(depth == 0 )dumpStr = "";
    var i = 0;
    for(i = 0; i < ar.length; i++){
        if(ar[i] instanceof Array){
            dumpStr += '[';
            dump(ar[i], depth + 1);
            dumpStr += ']';
        }else{
            dumpStr += ar[i];
        }
        if(i != ar.length - 1){
            dumpStr += ',';
        }
    }
    return dumpStr;
}


/*
var mcl = new MCL();
var o = mcl.parse("2*3 + 5*2;");
console.log(o);
console.log(mcl.calcAction);
dump(mcl.calcAction.block,0);
console.log(dumpStr);

var mce = new MCE();
var ret = mce.execute(mcl.calcAction.block);
console.log(ret);
*/
