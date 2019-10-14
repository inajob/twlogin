WebFontConfig = {
    google: { families: [ 'Tangerine', 'Cantarell' ] },
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

function Fonts(){
    this.cache = "";
    this.fontScript =null;
    this.fonts=[];
}
Fonts.prototype={
    add:function(fn){
	if(fn.length==0)return;
	if(fn instanceof Array)return;

	for(var i=0;i<this.fonts.length;i++){
	    if(this.fonts[i] == fn)return;
	}
	this.fonts.push(fn);
	this.load();
    },
    load:function(){
	var s = this.fonts.join("\n");
	if(this.cache == s)return;
	console.log(s);
	this.cache = s;
	if(this.fontScript!=null){
	    this.fontScript.parentNode.removeChild(fontScript);
	}
	WebFontConfig.google.families = this.fonts;
	(function() {
	    var wf = document.createElement('script');
	    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	    wf.type = 'text/javascript';
	    wf.async = 'true';
	    this.fontScript = document.getElementsByTagName('script')[0];
	    this.fontScript.parentNode.insertBefore(wf, this.fontScript);
	})();

    }
}


    function M(ctx,x,y,r,f){
	if(ctx==undefined)return;
    this.fonts = f;
    this.ctx = ctx;
    this.r = r;
    this.rstack = [];
    this.w = 1; // linewidth
    //M.prototype.shift.apply(this,[x*r,y*r])();
    this.ctx.fillStyle="rgba(0,0,0,0)";
    this.ctx.lineWidth="1";
    this.debug = false;
    
    this.ctx.miterLimit = 2.8;
    //this.ctx.lineJoin="bebel";
    this.fontName = "Sans-Serif";
    this.translate = {x:0,y:0,t:0};
}
M.prototype = {
    // ---- Ext canvas
    strokeEllipse:function(ctx,left, top, right, bottom) {
	var halfWidth = (right - left) / 2.0;
	var halfHeight = (bottom - top) / 2.0;
	var x0 = left + halfWidth;
	var y1 = top + halfHeight;
	//ctx.beginPath();
	var cw = 4.0 * (Math.sqrt(2.0) - 1.0) * halfWidth / 3.0;
	var ch = 4.0 * (Math.sqrt(2.0) - 1.0) * halfHeight / 3.0;
	ctx.moveTo(x0, top);
	ctx.bezierCurveTo(x0 + cw, top, right, y1 - ch, right, y1);
	ctx.bezierCurveTo(right, y1 + ch, x0 + cw, bottom, x0, bottom);
	ctx.bezierCurveTo(x0 - cw, bottom, left, y1 + ch, left, y1);
	ctx.bezierCurveTo(left, y1 - ch, x0 - cw, top, x0, top);
	//ctx.stroke();
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
	//this.ctx.beginPath();
	this.ctx.moveTo(this.r/2*(x + w*Math.cos(0)), this.r/2*(y + h*Math.sin(0)));
	for(var i=1; i<n; i++){
	    this.ctx.lineTo(this.r/2*(x + w*Math.cos(Math.PI*2/n*(i*s%n))), this.r/2*(y + h*Math.sin(Math.PI*2/n*(i*s%n))));
	}
	//this.ctx.stroke();
    },
    _fShape:function(o,fe){
	var self = this;
	f = function(){
	    var type  = o[1];
	    //var rs = o[2];
	    var len = o.length;
	    var offset = 0;
	    var x,y,w,h,n,s;
	    var bt,et;
	    if(type=="poly"){
		offset=2;
		n = o[2];
		s = o[3];
	    }
	    if(type=="arc"){
		offset=2;
		bt = o[2];
		et = o[3];
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
	    case 6: // shape,type,x,y,w,h
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
	    case 'arc':
	    self.ctx.arc(self.r * x, self.r * y, self.r * w/2, bt * Math.PI * 2, et * Math.PI * 2, false);
	    break;
	    default:
	    console.log("unknown shape");
	    console.log(o);
	    }
	}
	this.ctx.beginPath();
	f();
	if(o[1]!="arc"){
	    this.ctx.closePath();
	}
	fe(); // fill or stroke
    },
    drawShape:function(o){
	var self = this;
	this._fShape(o,function(){self.ctx.fill();});
	if(this.w != 0){
	    this._fShape(o,function(){self.ctx.stroke();});
	}
	return this;
    },
    clip:function(shape,ar){
	var self = this;
	this.save(function(){
		self._fShape(shape[1],function(){self.ctx.clip();});
		self.begin(ar);
	    });
	return this;
    },
    fig:function(isClose,ar){
	//console.log(ar); // ["xy",[a1,a2,a3]]
	var unbegin = function(a){
	    if(a instanceof Array){
		if(a[0] == "begin"){
		    return unbegin(a[1]);
		}
		else if(a.length==1)
		    return unbegin(a[0]);
		return a;
	    }else{
		return a;
	    }
	}
	var x,y;
	var p;
	this.ctx.beginPath();
	for(var i = 0; i < ar.length; i ++){
	    p = ar[i][1];
	    if(i==0){
		x = p[0];
		y = p[1];
		this.ctx.moveTo(this.r * x/2, this.r * y/2);
	    }else{
		switch(p.length){

		case 2:  // line
		    this.ctx.lineTo(this.r * p[0]/2, this.r * p[1]/2);
		    break;
		case 4:  // quadratic
		    this.ctx.quadraticCurveTo(this.r * p[0]/2, this.r * p[1]/2,this.r * p[2]/2, this.r * p[3]/2);
		    break;
		case 5: // arc
		    this.ctx.arcTo(this.r * p[0]/2, this.r * p[1]/2,this.r * p[2]/2, this.r * p[3]/2, this.r * p[4]/2);
		    break;
		case 6: // bezier
		    this.ctx.bezierCurveTo(this.r * p[0]/2, this.r * p[1]/2,this.r * p[2]/2, this.r * p[3]/2, this.r * p[4]/2, this.r * p[5]/2);
		    break;
		}
	    }
	    //console.log(x*this.r,y*this.r);
	}
	if(isClose==0)this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.fill();
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
	this.ctx.font = (this.r)+"px '"+this.fontName+"'";
	var m = this.ctx.measureText(s);
	this.ctx.fillText(s,-m.width/2,0);
	if(this.w!=0){
	    this.ctx.beginPath();
	    this.ctx.strokeText(s,-m.width/2,0);
	}
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
	var saveParam = this.w;
	this.ctx.lineWidth = w * this.r / 100;
	this.w = w;
	this.begin(ar);
	this.ctx.lineWidth = save;
	this.w = saveParam;
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
	
	this.ctx.shadowColor="black";
	this.ctx.shadowBlur = b;
	this.begin(ar);
	this.ctx.shadowBlur = save;
	this.ctx.shadowColor="rgba(0,0,0,0)";
    },
    font:function(fn,ar){
	var self = this;
	this.fonts.add(fn);
	this.save(function(){
		var s = self.fontName;
		self.fontName=fn;
		self.begin(ar);
		self.fontName = s;
	    });	
    },
    save:function(f){
	this.ctx.save();
	var r ={};
	r.x = this.translate.x;
	r.y = this.translate.y;
	r.t = this.translate.t;

	this.rstack.push(this.r);
	try{
	    f.apply(this);
	}catch(e){
	    this.ctx.restore();
	    this.r = this.rstack.pop();
	    throw(e);
	}
	
	this.ctx.restore();
	this.r = this.rstack.pop();

	r.x = this.translate.x;
	r.y = this.translate.y;
	r.t = this.translate.t;
	return this;
    },
    //------------------------------
    shift:function(x,y,ar){
	var self = this;
	self.save(function(){
		self.translate.x += x * self.r * Math.cos(self.translate.t);
		self.translate.y += y * self.r * Math.sin(self.translate.t);

		self.ctx.translate(x * self.r, y * self.r);
		self.begin(ar);
	    });
	return self;
    },
    rotate:function(t,ar){
	var self = this;
	self.save(function(){
		self.translate.t += t * Math.PI*2
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
    begin:function(ar){
	var i,j;
	var f;
	var arg;
	var tmp;
	var self = this;
	var err = false;
	if(ar == undefined){ // skip undefined
	    return this;
	}
	for(i = 0; i < ar.length; i++){
	    if(ar[i] == null)continue; // skip null
	    f = this[ar[i][0]]; // first is function
	    arg = []; // load arguments slice 1..last
	    for(j = 1; j < ar[i].length; j++){
		tmp = ar[i];
		arg.push(ar[i][j]);
	    }
	    try{
		if(f==undefined)return this;
		tmp = f.apply(this, arg); // apply
	    }catch(e){ // all error catch
		logp(e +"\n" + ar[i]);
		//console.log(e);
		//console.log(e.stack);
		err =true;
	    }
	    
	}
	return this;
    }
}
