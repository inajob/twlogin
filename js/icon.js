function IconObj(size){
    this.data = [];
    this.base = null;
    this.mousef = false;
    this.lastObj = null;
    this.w = 24;
    this.h = 24;
    this.editable = true;
    this.size = size;
}

IconObj.prototype = {
    action:function(e){
	if(this.editable && this.mousef && this.lastObj != e.target){
	    if($(e.target).css('background-color') == 'white'){
		$(e.target).css('background-color','black');
	    }else{
		$(e.target).css('background-color','white');
	    }
	    this.lastObj = e.target;
	}
    },
    mkIcon:function(e){
	this.base = e;
	var self = this;
	var l;
	// make dot
	for(var j=0;j<this.h;j++){
	    l = $('<div>');
	    this.data[j] = [];
	    for(var i=0;i<this.w;i++){
		this.data[j][i]=$('<div>').appendTo(l)
		    .css('width', this.size + 'px')
		    .css('height', this.size + 'px')
		    .css('float', 'left')
		    .css('background-color','white')
		    .bind("mousemove",function(e){
			    self.action.apply(self,[e]);
			    e.preventDefault();
			})
		    .bind("click",function(e){
			    self.mousef = true;
			    self.action.apply(self,[e]);
			    self.mousef = false;
			    e.preventDefault();
			});
	    }
	    l.css('clear','both');
	    l.appendTo(e);
	}
	/*
	var palette = $('<div>')
	.css('padding-top','10px')
	.css('clear','both');
	e.append(palette);
	palette.append($('<div class="icon-pixcel">'));
	palette.append($('<div class="icon-pixcel">'));
	*/
	e.bind("mousedown",function(e){
		self.mousef = true;
	    });
	e.bind("mouseup",function(e){
		self.mousef = false;
		self.lastObj = null;
	    });
    },
    dump:function(){
	var out = "#1 " + this.w + " " + this.h + "\n";
 	for(var j=0;j<this.h;j++){
	    for(var i=0;i<this.w;i++){
		if(this.data[j][i].css('background-color')=='white'){
		    out += '0';
		}else{
		    out += '1';
		}
	    }
	}
	return out;
    },
    load:function(s,e){
	var sl = s.split('\n');
	var setting = sl[0].split(' ');
	var v = setting[0];
	var w = setting[1];
	var h = setting[2];
	var data = sl[1];

	this.w = w;
	this.h = h;
	this.mkIcon(e);

 	for(var j=0;j<this.h;j++){
	    for(var i=0;i<this.w;i++){
		if(data.charAt(this.h * j + i)==0){
		    this.data[j][i].css('background-color','white');
		}else{
		    this.data[j][i].css('background-color','black');
		}
	    }
	}

    }
}