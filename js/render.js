// render.js

// Render言語のとても簡単なパーサ
var SimpleParser = function(){};
SimpleParser.prototype = {
    parse: function(s) { 
        var lines = s.split(/[\r\n]+/);
        var ls;
        var out = [];
        for(var i = 0; i < lines.length; i ++){
            ls = lines[i].split(/\s+/);
            out.push(this.proc(ls));
        }
        return out;
    },
    proc : function(t){
        var tmp = [];
        switch(t[0]){
        case 'fillText':
        case 'strokeText':
        case 'font':
            tmp[0] = t[0];
            tmp[1] = t.slice(1).join(" ");
            return tmp;
        case 'scale':
        case 'shift':
        case 'rotate':
        case 'skew':
        case 'blur':
        case 'bs':
        case 'save':
        case 'restore':
        case 'beginPath':
        case 'lineTo':
        case 'quadTo':
        case 'arcTo':
        case 'bezierTo':
        case 'moveTo':
        case 'closePath':
        case 'fill':
        case 'stroke':
        case 'clip':
        case 'resetClip':
        case 'affine':
        case 'resetAffine':
        case 'fs':
        case 'ss':
        case 'lw':
        case 'radialGrad':
        case 'linearGrad':
        case 'cs':
        case 'fsGrad':
        case 'ssGrad':
        case 'createImage':
        case 'drawImage':
        case 'setTarget':
        case 'drawExtImage':
        //case 'fsPattern':
            return t;
        }
    }
}


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

Affine.prototype = {
    mul:function(a){
	
	
	var tmp = 0;
	var next = [];
	for(var i = 0; i < 3; i++){
	    for(var j = 0; j < 3; j++){
		tmp = 0;
		for(var k = 0; k < 3; k++){
		    tmp += this.data[i][k] * a.data[k][j];
		    //tmp += a.data[i][k] * this.data[k][j]
		}
		

		if(next[i] == undefined)next[i] = [];
		next[i].push(tmp);
	    }
	}
	this.data = next;

    },
    calc:function(x,y){
		var tmp = 0;
		var ans = [];
		var a = [x, y, 1];
		for(var i = 0; i < 3; i++){
			tmp = 0;
			for(var j = 0; j < 3; j++){
				tmp += this.data[i][j] * a[j]
			}
			ans.push(tmp);
		}
    	return ans;
    },
    clone:function(){
	var o = new Affine();
	for(var i = 0; i < 3; i++){
	    for(var j = 0; j < 3; j++){
		o.data[i][j] = this.data[i][j]
	    }
	}
	return o;
    }
}


// レンダラ
// Canvasを簡単に使うために利用
    var Renderer = function(ctx, fonts,size){
    this.size = size
    this.ctx = ctx;
    this.fonts = fonts;
    this.patternCanv = [];  // パターン塗りつぶし用キャンバス
    this.ctxTmp = null;       // 待避用ctx
    this.ctxId = 0;
    this.imgCache = {};  // 画像のキャッシュ
};
Renderer.prototype = {
    afX:function(x,y){return this.affine.calc(parseFloat(x), parseFloat(y))[0];},
    afY:function(x,y){return this.affine.calc(parseFloat(x), parseFloat(y))[1];},
    theta:function(theta){return Math.PI * theta},
    skew:function(theta,theta2){
        theta = this.theta(parseFloat(theta));
        theta2 = this.theta(parseFloat(theta2));
        this.affine.mul(new Affine(1,Math.tan(theta),0, Math.tan(theta2),1,0, 0,0,1));
    },
    scale:function(x,y){
        this.affine.mul(new Affine(parseFloat(x),0,0, 0,parseFloat(y),0, 0,0,1));
    },
    shift:function(x,y){
        this.affine.mul(new Affine(1,0,parseFloat(x), 0,1,parseFloat(y), 0,0,1));  // shift
    },
    rotate:function(theta){
        theta = this.theta(parseFloat(theta));
        this.affine.mul(new Affine(Math.cos(theta),-Math.sin(theta),0,
                                   Math.sin(theta), Math.cos(theta),0,
                                   0,0,1));  // rotate
    },
    
    save:function(){this.ctx.save();this.stack.push(this.affine.clone());},
    restore:function(){this.affine = this.stack.pop();this.ctx.restore();},
    beginPath:function(){this.ctx.beginPath();},
    lineTo:function(x,y){this.ctx.lineTo(this.afX(x,y), this.afY(x,y));},
    quadTo:function(x,y,x2,y2){this.ctx.quadraticCurveTo(this.afX(x,y), this.afY(x,y), this.afX(x2,y2), this.afY(x2,y2));},
    arcTo:function(x,y,x2,y2,r){
      var tx = this.affine.data[0][0];
      var ty = this.affine.data[1][1];
      var d = r * Math.sqrt(tx*tx + ty*ty);
      this.ctx.arcTo(this.afX(x,y), this.afY(x,y), this.afX(x2,y2), this.afY(x2,y2), d);
    },
    bezierTo:function(x,y,x2,y2,x3,y3){this.ctx.bezierCurveTo(this.afX(x,y), this.afY(x,y), this.afX(x2,y2), this.afY(x2,y2), this.afX(x3,y3), this.afY(x3,y3));},
    moveTo:function(x,y){this.ctx.moveTo(this.afX(x,y), this.afY(x,y));},
    closePath:function(){this.ctx.closePath();},
    fill:function(){this.ctx.fill();},
    stroke:function(){this.ctx.stroke();},
    clip:function(){this.ctx.save();this.ctx.clip();},
    resetClip:function(){this.ctx.restore();},
    
    affine:function(m11, m12, m21, m22, dx, dy){this.ctx.save();this.ctx.transform(m11, m12, m21, m22, dx, dy);},
    resetAffine:function(){this.ctx.restore();},
    
    fillText:function(text){
        this.ctx.save();
        this.ctx.transform(
                           this.affine.data[0][0], this.affine.data[1][0],
                           this.affine.data[0][1], this.affine.data[1][1],
                           this.affine.data[0][2], this.affine.data[1][2]
                           );

        var m = this.ctx.measureText(text);
        this.ctx.fillText(text, -m.width / 2, 0);
        this.ctx.restore();
    },
    strokeText:function(text){
        this.ctx.save();
        this.ctx.transform(
                           this.affine.data[0][0], this.affine.data[1][0],
                           this.affine.data[0][1], this.affine.data[1][1],
                           this.affine.data[0][2], this.affine.data[1][2]
                           );
        var m = this.ctx.measureText(text);
        this.ctx.strokeText(text, -m.width / 2, 0);
        this.ctx.restore();
    },
    blur:function(s){this.ctx.shadowBlur = s * this.size /400;},
    bs:function(s){this.ctx.shadowColor = s;},
    fs:function(s){this.ctx.fillStyle = s;},
    ss:function(s){this.ctx.strokeStyle = s;},
    lw:function(s){this.ctx.lineWidth = s/200 * this.size /400;},
    font:function(s){this.fonts.add(s); this.ctx.font = "12px '"+s+"'";}, // todo: スペースがあれば削る？
    radialGrad:function(x0,y0,r0,x1,y1,r1){this.grad = this.ctx.createRadialGradient(this.afX(x0,y0),this.afY(x0,y0),r0,this.afX(x1,y1),this.afY(x1,y1),r1)},  // 楕円変形がデキないので辛い
    linearGrad:function(x0,y0,x1,y1){this.grad = this.ctx.createLinearGradient(this.afX(x0,y0),this.afY(x0,y0),this.afX(x1,y1), this.afY(x1,y1))},
    cs:function(pos, col){this.grad.addColorStop(pos,col);},
    fsGrad:function(){this.ctx.fillStyle = this.grad;},
    ssGrad:function(){this.ctx.strokeStyle = this.grad;},
    createImage:function(id,w, h){
      id = parseInt(id);
      w = parseInt(w);
      h = parseInt(h);
      this.patternCanv[id] = document.createElement('canvas');
      this.patternCanv[id].width = w;
      this.patternCanv[id].height = h;


      //console.log("create image " + id + ' ' + this.patternCanv[id]);
    },
    setTarget:function(id){
      id = parseInt(id);
      if(id == 0){
        // デフォルトCanvasのコンテキストに戻す
        this.ctx = this.ctxTmp;
      }else{
        // デフォルトCanvasのコンテキストを待避
        if(this.ctxId == 0){
          this.ctxTmp = this.ctx;
	}
        //console.log("set target " + id + ' ' + this.patternCanv[id]);
        this.ctx = this.patternCanv[id].getContext('2d');
        var size = this.patternCanv[id].width;
        this.ctx.setTransform(size/2 , 0, 0, size/2, size/2, size/2);
        this.ctx.clearRect(-1,-1,4,4);
        this.ctx.fillStyle = "transparent";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.005;
        this.ctx.lineJoin = "miter";
        this.ctx.miterLimit = 10;
        this.ctx.textBaseline = "middle";
        this.ctx.font = "18px '"+ this.fontName +"'";
      }
      this.ctxId = id;
    },
    /*
    fsPattern:function(id, rep){
      id = parseInt(id);
      var pattern = this.ctx.createPattern(this.patternCanv[id], rep);
      this.ctx.fillStyle = pattern;
    },
    */
    drawImage:function(id){
      id = parseInt(id);
      this.ctx.save();
      this.ctx.transform(
                         this.affine.data[0][0], this.affine.data[1][0],
                         this.affine.data[0][1], this.affine.data[1][1],
                         this.affine.data[0][2], this.affine.data[1][2]
                         );
      this.ctx.drawImage(this.patternCanv[id], -this.patternCanv[id].width/2, -this.patternCanv[id].height/2);
      this.ctx.restore();
    },
    drawExtImage:function(url){
      this.ctx.save();
      this.scale(0.001, 0.001);
      this.ctx.transform(
                         this.affine.data[0][0], this.affine.data[1][0],
                         this.affine.data[0][1], this.affine.data[1][1],
                         this.affine.data[0][2], this.affine.data[1][2]
                         );
      var img = new Image();
      if(this.imgCache[url]){
        img = this.imgCache[url];
      }else{
        img.src = '../imgproxy.php?url=' + encodeURIComponent(url);
        this.imgCache[url] = img;
      }
      this.ctx.drawImage(img, -img.width/2, -img.height/2);
      this.ctx.restore();

      this.ctx.save();
      this.shift(0, img.height/2);
      this.strokeText(url);
      this.fillText(url);
      this.ctx.restore();

    },
    
    render: function(o, width,height){
        if(!height)height = width;
        var size = Math.max(width,height);
        var target;
        var j;
        this.size = size;       
        // 座標変換
        this.ctx.setTransform(size/2 , 0, 0, size/2, width/2, height/2);
        this.ctx.clearRect(-1,-1,4,4);
        this.ctx.fillStyle = "transparent";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 0.005;
	this.ctx.lineJoin = "miter";
	this.ctx.miterLimit = 10;
        this.ctx.textBaseline = "middle";
        this.fontName = "Sans-Serif";
        this.ctx.font = "18px '"+ this.fontName +"'";

        this.affine = new Affine();
        this.stack = [];

        for(var i = 0; i < o.length; i ++){
            target = o[i];
            if(!o[i])continue;
            if(this[o[i][0]]){
                this[o[i][0]].apply(this, target.slice(1));
            }else{
                console.log("unknown method [" + o[i][0] + "]");
            }
        }
    }
};


// web fontの設定

WebFontConfig = {
    google: { families: [ 'Tangerine', 'Cantarell' ] },
    custom: { families:[], urls:[]},
    loading:function(){},
    fontloading:function(){},
    fontactivate:function(family,fontDescription){
	
    },
    fontinacive:function(family,fontDescription){
	//fail
    },
    active:function(){
	// here!! all fonts loaded!
	//alert("loaded");
    },
    inactive:function(){
	//doesnot support webfont
    }
};

// フォントクラス
function Fonts(){
    this.cache = "";
    this.fontScript =null;
    this.fonts=['Yesteryear']; // 何か読み込まないとダメっぽい
    this.local=[];
}
Fonts.prototype={
    add:function(fn){
        /*
	if(fn.length==0)return;
	//if(fn instanceof Array)return;

	var flag = false;
	for(var i=0;i<this.fonts.length;i++){
	    if(this.fonts[i][0] == fn[0] && this.fonts[i][1] == fn[1])return;
	    if(this.fonts[i][0] == fn[0]){
		flag = true;
		for(var j = 0; j < fn[1].length; j ++){
		    if(this.fonts[i][1].indexOf(fn[1][j])==-1){
			console.log("add char" + fn[1][j]);
			this.fonts[i][1] += fn[1][j];
			this.reload = true;
		    }else{
		    }
		}
	    }
	}
	if(!flag){
	    this.reload = true;
	    console.log("append")
	    console.log(fn);
	    this.fonts.push(fn);
	}
        */
	//this.load();

	
	if(fn.length==0)return;
	if(fn instanceof Array)return;

	for(var i=0;i<this.fonts.length;i++){
	    if(this.fonts[i] == fn)return;
	}
        // ホスティングしているフォントの読み込み
        var localFonts =
          ['TanukiMagic', 'DejimaMincho', 'Hakidame','Mikachan','JiyunoTsubasa','AoyagiReisyoSimo',
           'UmeGothic', 'HanazonoMincho','IPAMincho', 'IPAGothic','RoundM+', 'M+Thin', 'M+Black', 'LogoTypeGothic',
           'Haranyan', 'KokuGothic', 'KokuMincho', 'MagicRing'
           ];
        var localFlg = false;
        for(var i = 0; i < localFonts.length; i ++){
            if(localFonts[i] == fn){
                localFlg = true;
                break;
            }
        }
        if(localFlg){
            for(var i=0;i<this.local.length;i++){
                if(this.local[i] == fn)return;
            }
            this.local.push(fn);
        }else{
            this.fonts.push(fn);
        }
	this.load();
	
    },
    load:function(){
	var s = this.fonts.join("\n") + this.local.join('\n');
        
	if(this.cache == s)return;
	this.cache = s;
	if(this.fontScript!=null){
	    this.fontScript.parentNode.removeChild(fontScript);
	}
	WebFontConfig.google.families = this.fonts;
        WebFontConfig.custom.families = this.local;
        WebFontConfig.custom.urls = ['../css/fonts.css'];
	/*
	(function() {
	    var wf = document.createElement('script');
	    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	    wf.type = 'text/javascript';
	    wf.async = 'true';
	    this.fontScript = document.getElementsByTagName('script')[0];
	    this.fontScript.parentNode.insertBefore(wf, this.fontScript);
	})();
	*/
	WebFont.load(WebFontConfig);
    }
}



