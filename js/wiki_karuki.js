
// wikiエンジンは純粋な文書を変換する
// ここで extな情報を付加する
function afterProc(parent,cssString,isEdit){
    var tmp,tmp2;

    //========================================
    // CSS test
    
    // dummy
	
    //========================================


    //========================================
    // link
    $('.link').bind('click',function(e){
	    var rel = $(this).attr("rel");
	    document.location.href = encodeURIComponent(user_id+":"+rel+".html");
	    //alert(rel +" "+user_id);
	});
    
    //========================================
    // load icon?
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
	if(ds[i].className=='embedurl'){
	    targets.push(ds[i]);
	}
    }
    var queue = [];
    for(i = 0; i < targets.length; i++){
	//$(targets[i]).css('display','inline-block');
	//loadIcon(targets[i],$(targets[i]).attr('rel'));
	queue.push(targets[i]);
    }
    var lazyLoad = function(){
	var o = queue.pop();
	if(o){
	    $(o).css('display','inline-block');
	    loadIcon(o,$(o).attr('rel'));
	    setTimeout(lazyLoad,1);
	}
    }
    lazyLoad();
    //========================================
    
    // =======================
    // load external contents
    //
    // twitpic??
    //
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
	if(ds[i].className=='embedtwitpic' && ds[i].changeFlag!=true){
	    targets.push(ds[i]);
	}
    }
    for(i = 0; i < targets.length; i++){
	var o = targets[i];
	if(o){
	    $(o).attr('class','twitpic');
	    $(o).css('display','inline-block');
	    $(o).css({
		    border:"solid #4aa",
			borderWidth:"10px 1px 1px 1px",
			backgroundColor:"white",
			padding:"1em",
			textAlign:"center",
			float:"right",
			margin:"0.5em"
			});
	    $(o).text("");
	    tmp = $(o).attr('rel').split(" ");
	    $(o).append(
			$('<a>')
			.attr('href','http://twitpic.com/' + tmp[0])
			.attr('target','_blank')
			.append(
				$('<img>')
				.attr("src","http://twitpic.com/show/thumb/" + tmp[0])
				)
			.append($('<div>').text(tmp[1]))
			);
	    //$(o).append($('<div>').text("http://twitpic.com/" + $(o).attr('rel')));
	    o.changeFlag = true;
	}		      
    }
    //==========================-

    // =======================
    // load external contents
    //
    // flickr
    //
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
	if(ds[i].className=='embedflickr' && ds[i].changeFlag!=true){
	    targets.push(ds[i]);
	}
    }
    for(i = 0; i < targets.length; i++){
	var o = targets[i];
	if(o){
	    $(o).attr('class','flickr');
	    $(o).css('display','inline-block');
	    $(o).css({
		    border:"solid #939",
			borderWidth:"10px 1px 1px 1px",
			backgroundColor:"white",
			padding:"1em",
			textAlign:"center",
			float:"right",
			margin:"0.5em"
			});
	    $(o).text("");
	    tmp = $(o).attr('rel').split(" ");
	    tmp2 = tmp.slice(2).join(" ");
	    $(o).append(
			$('<a>')
			.attr('href',tmp[1])
			.attr('target','_blank')
			.append($('<img>')
				.attr("src",tmp[0]))
			.append($('<div>').text("by " + tmp2))
			);
	    //$(o).append($('<div>').text($(o).attr('rel')));
	    o.changeFlag = true;
	}		      
    }
    //==========================-

    // =======================
    // load external contents
    //
    // map
    //
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
	if(ds[i].className=='embedmap' && ds[i].changeFlag!=true){
	    targets.push(ds[i]);
	}
    }
    var key = inajob.ykey;
    for(i = 0; i < targets.length; i++){
	var o = targets[i];
	if(o){
	    $(o).attr('class','map');
	    $(o).css('display','inline-block');
	    $(o).css({
		    border:"solid #44a",
			borderWidth:"10px 1px 1px 1px",
			backgroundColor:"white",
			padding:"1em",
			textAlign:"center",
			float:"right",
			margin:"0.5em"
			});
	    $(o).text("");
	    tmp = $(o).attr('rel').split(" ");
	    $(o).append(
			$('<a>')
			//.attr('href',tmp[1])
			//.attr('target','_blank')
			.append($('<img>')
				.attr("src",
				      "http://map.olp.yahooapis.jp/OpenLocalPlatform/V1/static?appid=" + inajob.key.ykey + "&lat=" + tmp[1] + "&lon=" + tmp[0]+"&width=200&height=200&z=" + tmp[2] + "&pointer=on"
				      ))
			//.append($('<div>').text("by " + tmp[2]))
			);
	    //$(o).append($('<div>').text($(o).attr('rel')));
	    o.changeFlag = true;
	}		      
    }
    //==========================-
    
    // =======================
    // load external contents
    //
    // amazon
    //
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
	if(ds[i].className=='embedamz' && ds[i].changeFlag!=true){
	    targets.push(ds[i]);
	}
    }
    for(i = 0; i < targets.length; i++){
	var o = targets[i];
	if(o){
	    $(o).attr('class','amz');
	    $(o).css('display','inline-block');
	    $(o).css({
		    border:"solid #6a6",
			borderWidth:"10px 1px 1px 1px",
			backgroundColor:"white",
			padding:"1em",
			textAlign:"center",
			float:"right",
			margin:"0.5em",
			wordBreak:"break-all",
			fontSize:"small"
			});
	    $(o).text("");
	    tmp = $(o).attr('rel').split(" ");
	    
	    $(o).append(
			$('<a>')
			.attr('href',tmp[2])
			.attr('target','_blank')
			.append($('<img>')
				.css('border','solid 1px')
				.attr("src", tmp[1]
				      ))
			.append($('<div>').text(""+tmp[3]))
			);
	    //$(o).append($('<div>').text($(o).attr('rel')));
	    o.changeFlag = true;
	}		      
    }
    //==========================-

    // =======================
    // load external contents
    //
    // mce?
    //
    /*
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
        if(ds[i].className=='embedmce3' && ds[i].changeFlag!=true){
    	targets.push(ds[i]);
        }
    }
    var globalTimer = 0;
    var mouseX,mouseY;
    var fonts = new Fonts();
    var sources = new Sources();
    
    var draw=function(canv,s){
        // global?
        mt = new MersenneTwister(2);
        if(canv.getContext){
    	var ctx = canv.getContext("2d");
    	ctx.clearRect(0,0,400,400);
    	ctx.save();
    	ctx.translate(200,200);
    	
    	
    	var mcl = new MCL();
    	mcl.globalTimer = globalTimer;
    	mcl.mouseX = mouseX;
    	mcl.mouseY = mouseY;
    	mcl.sources = sources;
    	var parsed = mcl.parser.parse(mcl.preProcess(s), mcl.calcAction);
    	var out = mcl.levelNormalize();
    	
    	var m = new M(ctx,0,0,200,fonts);
    	var ret = mcl.toLispStyle(out, m);
    	
    	m.begin(ret);
    	ctx.restore();
        }
    }
    for(i = 0; i < targets.length; i++){
        var o = targets[i];
        var elm = document.createElement("canvas");
        if(o){
    	elm.width = "400";
    	elm.height = "400";
    	$(o).append(elm);
    	draw(elm,o.mce);
    	$(o).css('float','right');
    	setTimeout(function(){draw(elm,o.mce);},1000);
    	o.changeFlag = true;
        }		      
    }
    */
    // =======================
    // load external contents
    //
    // mce2?
    //
    
    var ds = parent.getElementsByTagName("div");
    var targets = [];
    for(var i = 0; i < ds.length; i++){
        if(ds[i].className=='embedmce4' && ds[i].changeFlag!=true){
    	targets.push(ds[i]);
        }
    }
    var globalTimer = 0;
    var mouseX,mouseY;
    var fonts = new Fonts();
    //var sources = new Sources();
// === Prelude ===
        var prelude = (function () {/*
!sqrt = \(n){
  eval("Math","sqrt",n)
};
!sin = \(n){
  eval("Math","sin",n * 3.1415 * 2)
};
!cos = \(n){
  eval("Math","cos",n * 3.1415 * 2)
};
!tan = \(n){
  eval("Math","tan",n * 3.1415 * 2)
};
!atan2 = \(y,x){
  eval("Math", "atan2", y, x)/(3.1415*2)
};



!floor = \(n){
  eval("Math","floor",n)
};

!save = \(){
  write("save");
  evalAllExtArgs();
  write("restore");
};
!lw = \(size){
  save(){
    write("lw " + size);
    evalAllExtArgs();
  };
};
!blur = \(size){
  save(){
    write("blur " + size);
    evalAllExtArgs();
  };
};
!bs = \(c){
  save(){
    write("bs " + c);
    evalAllExtArgs();
  };
};

!fs = \(c){
  save(){
    write("fs " + c);
    evalAllExtArgs();
  };
};
!ss = \(c){
  save(){
    write("ss " + c);
    evalAllExtArgs();
  };
};
!col = \(c){
  save(){
    write("ss " + c);
    write("fs " + c);
    evalAllExtArgs();
  };
};
!ssfs = \(c1,c2){
  save(){
    write("ss " + c1);
    write("fs " + c2);
    evalAllExtArgs();
  };
};
!cs = \(pos, col){
  write("cs " + pos + " " + col);
};
!rgrad = \(x0,y0,r0,x1,y1,r1){
  write("radialGrad " + x0 + " " + y0 + " " + r0 + " " + x1 + " " + y1 + " " + r1);
  evalAllExtArgs();
};
!lgrad = \(x0,y0,x1,y1){
  write("linearGrad " + x0 + " " + y0 + " " + x1 + " " + y1);
  evalAllExtArgs();
};
!fsgrad = \(){
  save(){
    evalExtArg(0);
    write("fsGrad");
    block("a"){
      !a = 1;
      loop(extArgsLength() - 1){
        evalExtArg(a);
        !a = a + 1;
      }
    }
  };
};
!ssgrad = \(){
  save(){
    evalExtArg(0);
    write("ssGrad");
    block("a"){
      !a = 1;
      loop(extArgsLength() - 1){
        evalExtArg(a);
        !a = a + 1;
      }
    }
  };
};
!skew = \(t,t2){
  save(){
    write("skew " + t + " " + t2);
    evalAllExtArgs();
  };
};

!rotate = \(t){
  save(){
    write("rotate " + t);
    evalAllExtArgs();
  };
};
!scale = \(w,h){
  if(not(h)){
    !h = w;
  };
  save(){
    write("scale " + w + " " + h);
    evalAllExtArgs();
  };
};
!shift = \(x,y){
  save(){
    write("shift " + x + " " + y);
    evalAllExtArgs();
  };
};
!outerFig = 1;
!fig = \(closed){
  write("beginPath");
  !outerFig = 0;
  evalAllExtArgs();
  !outerFig = 1;
  if(closed){
    write("closePath");
  };
  write("fill");
  write("stroke");
};
!blockClip = \(closed){
  write("beginPath");
  !outerFig = 0;
  evalExtArg(0);
  !outerFig = 1;
  if(closed){
    write("closePath");
  };
  write("clip");
  evalExtArg(1);
  write("resetClip");
};

!autoFig = \(){
  if(outerFig){
    write("beginPath");
  };
  evalAllExtArgs();
  if(outerFig){
    write("closePath");
    write("fill");
    write("stroke");
  };
}
!rect = \(){
  autoFig(){
    write("moveTo -0.5 -0.5");
    write("lineTo 0.5 -0.5");
    write("lineTo 0.5 0.5");
    write("lineTo -0.5 0.5");
  };
};
!rrect = \(){
  autoFig(){
    write("moveTo -0.5 -0.5");
    write("lineTo -0.5 0.5");
    write("lineTo 0.5 0.5");
    write("lineTo 0.5 -0.5");
  };
};

!xy0 = \(x,y){
  write("moveTo " + x + " " + y);
}
!xy = \(x,y){
  write("lineTo " + x + " " + y);
}
!grid = \(xx,yy){
  block("aa","bb"){
    !aa = 0;
    !bb = 0;
    loop(xx){
      !bb = 0;
      !aa = aa + 1;
      loop(yy){
        !bb = bb + 1;
        shift(aa - xx/2 - 0.5 ,bb - yy/2 - 0.5){
          evalAllExtArgs();
        }
      }
    }
  }
};

!flower = \(n){
  block("a"){
    !a = 0;
    loop(n){
      rotate(a/n*2){
        evalAllExtArgs();
      }
      !a = a + 1;
    }
  }
}

!text = \(s){
  scale(0.1){
    write("fillText " + s);
    write("strokeText " + s);
  }
}
!fillText = \(s){
  write("fillText " + s);
}
!strokeText = \(s){
  write("strokeText " + s);
}
!rgb = \(r,g,b){"rgb(" + r + "," + g + "," + b + ")"};
!rgba = \(rr,gg,bb,aa){"rgba(" + rr + "," + gg + "," + bb + "," + aa + ")"};

!poly = \(n, p){
 block("ploya"){
   !polya = 0;
   autoFig(0){
    loop(n){
     !polya = polya + 1;
     rotate((polya*p)/n * 2){
      write("lineTo 0 0.5");
     }
    }
   }
 }
};

!apoly = \(mode,size){
 block("r2","a"){
  scale(0.3){
   !r2 = 1/cos(1/mode/2)
   fig(1){
    !a = 0
    write('moveTo ' + cos(-1/mode/2) + ' ' + sin(-1/mode/2))
    loop(mode){
     write('arcTo' + ' ' + r2*cos((a*2)/mode/2) + ' ' + r2*sin((a*2)/mode/2) + ' ' + cos((a*2+1)/mode/2) + ' ' + sin((a*2+1)/mode/2) + ' ' + size)
     !a = a + 1
    }
   }
  }
 }
}

!font = \(name){
  save(){
    write("font " + name);
    evalAllExtArgs();
  }
}
!circle = \(s){
 block("polyq","n","r2"){
  if(not(s)){
    !s = 1;
  }
  scale(s){
   !polya = 0;
   !n = 8;
   !r2 = 0.5/cos(1/n/2);
   autoFig(){
    write('moveTo 0.5 0')
    loop(n){
     !x1 = 0.5 * cos((polya+1) / n);
     !y1 = 0.5 * sin((polya+1) / n);
     !x2 = r2 * cos(polya / n + 1 / n / 2);
     !y2 = r2 * sin(polya / n + 1 / n / 2);
   
     write("quadTo " + x2 + " " + y2 + " " + x1 + " " + y1);
     !polya = polya + 1;
    }
   }
  }
 }
}

!rcircle = \(s){
 block("polyq","n","r2"){
  if(not(s)){
    !s = 1;
  }
  scale(s){
   !polya = 0;
   !n = 8;
   !r2 = 0.5/cos(1/n/2);
   autoFig(){
    write('moveTo 0.5 0')
    loop(n){
     !x1 = 0.5 * cos((n-polya-1) / n);
     !y1 = 0.5 * sin((n-polya-1) / n);
     !x2 = r2 * cos((n-polya) / n - 1 / n / 2);
     !y2 = r2 * sin((n-polya) / n - 1 / n / 2);
   
     write("quadTo " + x2 + " " + y2 + " " + x1 + " " + y1);
     !polya = polya + 1;
    }
   }
  }
 }
}


                                    */}).toString().match(/[^]*\/\*([^]*)\*\/;{0,1}\}$/)[1];




    var draw=function(canv,s){
        // global?
        mt = new MersenneTwister(2);
        if(canv.getContext){
    	var ctx = canv.getContext("2d");
	/*
    	ctx.clearRect(0,0,400,400);
    	ctx.save();
    	ctx.translate(200,200);
    	*/

    	var mcl = new MCL();
    	var mce = new MCE();
        //mce.externalVar = externalVars;
        mce.createScope();
        mce.bindVariable('t', globalTimer);
        mce.bindVariable('mx', mouseX);
        mce.bindVariable('my', mouseY);
 
        // todo: PRELUDE
        var s = prelude + mcl.preProcess(s);
        var out = mcl.parse(s);
        var res = mce.run(out);
        var sout = mce.out;
        var p = new SimpleParser();
        var r = new Renderer(ctx, fonts, 400);
        var out = p.parse(sout);
        r.render(out, 400);
    	}
    }
    for(i = 0; i < targets.length; i++){
        var o = targets[i];
        var elm = document.createElement("canvas");
        if(o){
    	elm.width = "400";
    	elm.height = "400";
    	$(o).append(elm);
    	draw(elm,o.mce);
    	$(o).css('float','right');
    	setTimeout(function(){draw(elm,o.mce);},1000);
    	o.changeFlag = true;
        }		      
    }
	
	//==========================-
	
	// =======================
	// load external contents
	//
	// rss
	//
	var ds = parent.getElementsByTagName("div");
	var targets = [];
	for(var i = 0; i < ds.length; i++){
	    if(ds[i].className=='embedrss' && ds[i].changeFlag!=true){
		targets.push(ds[i]);
	    }
	}
	var feed;
	$(document.body).append($('<div id="feeds">').css("display","none"));

	var loader = function(){
	    var mode = 0;
	    var tmp;
	    var M_NORMAL = 0;
	    var M_HATENAPHOTO = 1;
	    var className = "";
	    for(i = 0; i < targets.length; i++){
		var t = targets[i];
		var o;

		$(t).text("");
		$(t).append(o = $('<div class="rss">'));
		if(o){
		    $(o).text("");
		    tmp = $(t).attr('rel').split(" ");
		    if(tmp[0].search(/http\:\/\/f\.hatena\.ne\.jp\//) == 0){
			mode = M_HATENAPHOTO;
			className = " class='hpic'";
		    }else{
			mode = M_NORMAL;
			className = "";
		    }
		    feed = new google.feeds.Feed(tmp[0]);
		    feed.setNumEntries(parseInt(tmp[1]));

		    feed.load(function(result) {
			    if(!result.error){
				$(o).append($('<h1>').append($('<a>').attr("href",result.feed.link).text(result.feed.title)));
				for(var i = 0; i < result.feed.entries.length; i ++){
				    $(o).append(tmp = $('<div'+className+'>')
						.append(
							$('<a>')
							.attr("href",result.feed.entries[i].link)
							.text(result.feed.entries[i].title)
							)
						);
				    if(mode == M_HATENAPHOTO){
					tmp.append($('<div>').html(result.feed.entries[i].content.replace('.jpg','_120.jpg')));
				    }
				}
			    }else{
				$(t).text("error**");
			    }});
		    o.changeFlag = true;
		}		      
	    }
	}
	var timer = function(){
	    if(window.google == undefined || window.google.load==undefined){
		setTimeout(function(){
			timer();
		    },1000)
	    }else{
		if(google.feeds==undefined){
		    //console.log("google: "+ google.load);
		    google.load("feeds", "1",{nocss:true,callback:function(){
				//console.log(google.feeds.Feed);
				loader();
			    }});
		}else{
		    loader();
		}
	    }
	}
	timer();
	
	//==========================-

	// =======================
	// rendering mermaid
	//
  // 初回ではmermaidが読み込めていないため（よくない）
  function loadMermaid(){
    if(typeof(mermaid) != "undefined"){
      mermaid.init({noteMargin:10}, ".embedmermaid");
    }else{
      setTimeout(function(){
        loadMermaid();
      },1000);
    }
  }
  loadMermaid();


	
	// =======================
	// load external contents
	//
	// embed
	//
	var ds = parent.getElementsByTagName("div");
	for(var i = 0; i < ds.length; i++){
    if(ds[i].className=='embedoembed' && ds[i].changeFlag!=true){
      var o =  ds[i];
      tmp = $(o).attr('rel').split(" ");

      if(tmp[0].indexOf('://twitter.com') != -1){
        $.getJSON(
            "https://api.twitter.com/1/statuses/oembed.json?url="+encodeURIComponent(tmp[0])+'&callback=?',
            function(o){
              return function(data){
                // oembedからの返事を基にデータを画面に埋め込む
                //console.log(data);
                $(o).empty();
                if(data.type == "photo"){
                  $(o).append($('<div>').text(data.title));
                  $(o).append($('<img>').attr("src",data.url));
                }else{
                  if(data.html){
                    $(o).html(data.html);
                  }
                  if(data.thumbnail_url){
                    $(o).append($('<img>').attr("src",data.thumbnail_url));
                  }
                }
              }
            }(o)
            );
    }else{
      $.getJSON(
          "http://api.embed.ly/1/oembed?key="+inajob.key.embedly+"&url="+encodeURIComponent(tmp[0])+'&callback=?',
          function(o){
            return function(data){
              // oembedからの返事を基にデータを画面に埋め込む
              //console.log(data);
              $(o).empty();
              if(data.type == "photo"){
                $(o).append($('<div>').text(data.title));
                $(o).append($('<img>').attr("src",data.url));
              }else if(data.type == "video"){
                if(data.html){
                  $(o).html(data.html);
                }
              }else{
                if(data.html){
                  $(o).html(data.html);
                }else{
                  if(data.url){
                    $(o).append($('<a>').attr('target','_blank').attr("href",data.url).text(data.title));
                    $(o).append($('<div>').text(data.description));
                  }

                }
                if(data.thumbnail_url){
                  $(o).append($('<img>').attr("src",data.thumbnail_url));
                }
              }
            }
          }(o)
      );
    }
  }
  }
	//==========================-


	// とりあえず遅らせて読み込む // RSSはメニューでキャッシュしてるので即表示に変更
	//setTimeout(function(){
	// =======================
	// load external contents
	//
	// ls
	//
	if(loadFileList){
        loadFileList(function(){
		var ds = parent.getElementsByTagName("div");
		var targets = [];
		for(var i = 0; i < ds.length; i++){
		    if(ds[i].className=='embedls' && ds[i].changeFlag!=true){
			targets.push(ds[i]);
		    }
		}
		
		for(i = 0; i < targets.length; i++){
		    var o = targets[i];
		    $(o).text("");
		    if(o){
			tmp = $(o).attr('rel').split(" ");
			var rs = new RegExp("^" + tmp[0]);
			var count = 0;
			var max = rss.length;
			if(tmp.length>=2 && tmp[1]!=""){
			    max = parseInt(tmp[1]);
			}
			for(var j = 0; j < rss.length; j++){ // rss は読み込み済み？
			    if(rss[j].title.indexOf((tmp[0]))!=0){
				continue;
			    }
			    if(count > max)break;
			    count ++;
			    $(o).append(
					$('<li>').append(
							 $('<a>')
							 .attr('href',rss[j].link)
							 .text(decodeURIComponent(rss[j].title.replace(rs,"")))
							 ));
			}
			if(count==0){
			    $(o).text("notfound");
			}
			o.changeFlag = true;
		    }		      
		}

	    },isEdit?'':'../');
	}
	//},200);
	//==========================-

}
