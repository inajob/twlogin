var user;

function check(f){
    $.ajax({
	    type:"GET",
		url: "action.php?action=check",
		cache:false,
		success:function(text){
		text = getFirstLine(text);
		if(text=="[]"){
		    // not log in
		    //alert("logout now");
		    alert("action.php?action=login&title=" + encodeURIComponent(document.location.hash.replace("#","")))
		    document.location="action.php?action=login&title=" + encodeURIComponent(document.location.hash.replace("#",""));
		}else{
		    var e = $.secureEvalJSON(text);
		    if(e['user_id'] && e['screen_name']){
			// log in
			//alert("ok hello "+ e['screen_name']);
			user = {user_id:e['user_id'],screen_name:e['screen_name']};
			f();
		    }else{
			// error?
			alert('error');
		    }
		}
	    }
	});
}
function getTitle(){
    var hash = document.location.hash.replace("#","");
    //console.log(user);

    if(hash.indexOf(':')==-1){
	hash = user.user_id+ ":"+hash;
    }
    return hash;
}

function load(title){
    $.ajax({
	    type:"GET",
		url: "data/" + title + ".html",
		cache:false,
		success:function(html){
		//console.log(xml);
		var parser = new DOMParser();
		var xml = parser.parseFromString(html, "text/xml");
		var body = xml.getElementsByTagName("pre")[0];
		wikiArea.value.value = body.firstChild.nodeValue;
		wikiArea.redraw();
	    },
		error:function(){
		alert("notfound");
		wikiArea.value.value = "";
		wikiArea.redraw();
		
	    }
	});
}

function save(){
    var tl = title.split(":");
    var tt;
    if(title.indexOf(':') == -1){
	tt = title;
    }else if(tl.length==2){
	tt = tl[1];
    }else{
	alert("title error");
	return;
    }
    //tt = (tt);
    var param = {title:tt,body:wikiArea.value.value,type:"wiki"};

    $.ajax({
	    type:"POST",
		url: "action.php?action=save",
		data:param,
		success:function(text){
		text = getFirstLine(text);
		if(text=="[]"){
		    // not log in
		    alert("logout now");
		}else{
		    var e = $.secureEvalJSON(text);
		    //alert(text);
		    if(e['success']=="ok"){
			alert("save");
		    }else{
			alert("save fail");
		    }
		}
	    }
	});
}
var wikiArea;
var title ;

function init(){
     check(function(){
	      title = getTitle();
	      load(encodeURIComponent(title));
	      $('#title').empty();
	      $("#title")
		  .append($('<a>')
			  .attr("href","data/"+encodeURIComponent(title)+".html")
			  .text(decodeURIComponent(title)));
	      
	  });
}

function insertTextAtPosition(obj, pos, txt) {
    obj.focus();
    if (jQuery.browser.msie) {
        pos.text = txt;
        pos.select();
    } else {
        var s = obj.value;
        var np = pos + txt.length;
        obj.value = s.substr(0, pos) + txt + s.substr(pos);
        obj.setSelectionRange(np, np);
    }
}


var gCaretPosition = 0;
function gGetCaretPosition(obj){
    gCaretPosition = _getCaretPosition(obj);
}
function getCaretPosition(){
    return gCaretPosition;
}
function _getCaretPosition(obj) {
    obj.focus();
    var pos;
    if (jQuery.browser.msie) {
        pos = document.selection.createRange();
    } else {
        //pos = obj.selectionStart;
	pos = obj.selectionEnd;
    }
    return pos;
}


var cache = new ElmCacher();

function loadIcon(e, name){
    var c = cache.get(name);
    $(e).text("");
    if(c!=undefined){
	var p = e.parentNode;
	if(p==null) return;
	//console.log(p);
	var nc = c.cloneNode(true);
	p.replaceChild(nc,e);
    }else{
	var fname = user.user_id + encodeURIComponent(':') + name + ".html";
	if(fname.indexOf(':')!=-1){
	    fname = name + ".html";
	}
	$.ajax({
		type:"GET",
		    url: "data/" + fname,
		    cache:false,
		    success:function(html){
		    //console.log(xml);
		    var parser = new DOMParser();
		    var xml = parser.parseFromString(html, "text/xml");
		    var body = xml.getElementsByTagName("pre")[0];
		    var dat =  body.firstChild.nodeValue;
		    var icon = new IconObj(1);
		    icon.load(dat,$(e));
		    cache.put(name, e);
		},
		    error:function(){
		    e.innerHTML = "notfound";
		    cache.put(name, e);
		}
	    });
    }
}

// テキストエリアの選択範囲を取得
function getSelectionTextarea(e)
{
    if( document.selection ) {// IE

	// ドキュメントのフォーカスをテキストエリアにあてる
	e.focus();

	// 現在フォーカスのあたっている選択範囲を取得する
	var r = document.selection.createRange();

	return r.text;

    } else if( e.setSelectionRange ) {// Mozilla(NN)

	// NNの場合は得にフォーカスをあてる必要はないが動作を同等にしている
	e.focus();

	// テキストエリアのvalueから開始位置と終了位置を指定して抜き出し
	return e.value.substring( e.selectionStart, e.selectionEnd );
    }

    return "ブラウザが対応していません";
}

var wikiParser = new WikiParser();
$(
  function(){
      $('body').layout({
	      appDefaultStyles:true
		  });
      
      var newStyle = document.createElement('style');newStyle.type = "text/css";
      document.getElementsByTagName('head').item(0).appendChild(newStyle);
      
      wikiArea = $('#wiki').css("height","100%").karuki({
	      /*engine:function(s){
		  var s = wikiParser.render(s);
		  return s;
		  },*/
	      postProc:function(e,s){
		  //console.log(e);
		  try{
		      wikiParser.cssString = "";
		      wikiParser.parse(s,e);
		      
		      var cssc = new CSSC();
		      var csscOut;
		      if(wikiParser.cssString){
			  csscOut = cssc.parse(wikiParser.cssString);
			  
			  // only chrome
			  while(newStyle.sheet.cssRules.length != 0){
			      newStyle.sheet.deleteRule(0);
			  }
			  var sout = "";
			  for(var i = 0; i < csscOut.length; i++){
			      var ids = csscOut[i].ids;
			      var attrs = csscOut[i].attrs;
			      var tmp = "";
			      for(var j = 0; j < attrs.length; j++){
				  tmp += PrefixFree.prefixCSS(attrs[j].name + ':' + attrs[j].value) + ' !important;\n'
				      }
			      sout = ids.join(' ') + '{\n' + tmp + '}\n\n';
			      newStyle.sheet.insertRule(sout, newStyle.sheet.cssRules.length);		
			  }
		      }
		  }catch(e){console.log(e)}
		  afterProc(e,null ,true);
		  $(wikiArea.preview).flickable(); //?
	      }});
      var downEv;
      var SelectDialog = function(enterFunc){
	  this.elm = $('<div>');//.css({width: '100%', height: '100%', overflow:'auto'});
	  this.innerElm = $('<div>');//.css({width: '100%', height: '100%', overflow:'auto'});
	  this.elm.append(this.innerElm);
	  this.items = [];
	  this.target = -1;
	  this.enterFunc = enterFunc;
	  var self = this;

	  this.innerElm.append($('<div>')
			       .append($('<button>')
				       .css({width:'100%',padding:'1em'})
				       .text('cancel')
				       .bind('click',function(){
					   self.closeDialog();
				       }))
			       );

	  
	  downEv = function(e){
	      switch(e.which){
	      case 37: // left
	      self.select(self.target - 1);
	      break;

	      case 39: // right
	      self.select(self.target + 1);
	      break;

	      case 13:
	      self.closeDialog();
	      // BEGIN
	      self.enterFunc(self.items[self.target], wikiArea.value);
	      //insertTextAtPosition(wikiArea.value, getCaretPosition(wikiArea.value), self.items[self.target].data); // .data [embed data]
	      // END

	      return false; // stop
	      break;
	      
	      case 27: // esc
	      self.closeDialog();

	      return false; // stop
	      break;
	      }
	  }
	  $(document).bind('keydown',downEv);

      }
      SelectDialog.prototype = {
	  closeDialog:function(){
	      popupDiv.css('display','none');
	      wikiArea.value.focus();
	      popupDiv.empty();
	      popupDiv.remove();
	      popupDiv = null;
	      $(document).unbind('keydown',downEv);
	  },
	  add:function(e){
	      this.innerElm.append(e);
	      this.items.push(e);
	      if(this.items.length == 1){
		  this.select(0);
	      }
	  },
	  decide:function(){
	      this.enterFunc(this.items[this.target], wikiArea.value);
	      this.closeDialog();
	  },
	  select:function(n){
	      if(n < 0 || n >= this.items.length){ // out of range
		  return;
	      }
	      if(this.target != -1){
		  this.items[this.target].css('border', 'none');
	      }
	      this.items[n].css('border', 'dashed white 2px');
	      this.target = n;
	      // todo: きもいのでなおす
	      $(this.elm[0].parentNode.parentNode.parentNode.parentNode).scrollTo(this.items[n],0);

	      // functionalize?
	  }
      }
      
      var isCtrl = false;
      $(wikiArea.value).bind('keydown',function(e){
	      if(e.which == 17) isCtrl=false;
	  });
      var popupDiv = null;
      /*
      $(wikiArea.value).bind('keydown',function(e){
	      $('#selbox').text($(wikiArea.value).getSelection().text+'*');
	  });
      */
      setInterval(function(){
	      if(popupDiv == null){
		  gGetCaretPosition(wikiArea.value);
		  $('#selbox').text($(wikiArea.value).getSelection().text+'*'+gCaretPosition);
	      }
	  },500);
      $(wikiArea.value).bind('keydown',function(e){
	      if(e.which == 17) isCtrl=true;
	      if(e.which == 39){ // right
		  /*
		  if(popupDiv != null && popupDiv.css('display')=='block'){
		      popupDiv.css('display','none')
		  }
		  */
	      }

	      // テキストを挿入する
	      var enterFunc = function(o, e){
		  // o : embed
		  // e : textareea element
		  insertTextAtPosition(e, getCaretPosition(e), o.data); // .data [embed data]
	      }

	      if(e.which == 13/* && isCtrl == true*/){
		  //console.log('Ctrl + S');
		  // ==================
		  var selText = getSelectionTextarea(wikiArea.value);
		  if(selText.length!=0){
		      var elm1,elm2;
		      if(popupDiv==null){
			  // create popup window
			  popupDiv = $('<div class="popup">')
			      .append($('<div class="popup-content">')
				      .append(
					      elm2 = $('<select size="10">')
					      .append($('<option selected>').text('twitpic'))
					      .append($('<option>').text('flickr'))
					      .append($('<option>').text('map'))
					      .append($('<option>').text('amazon'))
					      .append($('<option>').text('search'))
					      )
				      .append(
					      elm1 = $('<input type="text">').val(selText)
					      )
				      );

			      //text("[" + selText + "]");
			  popupDiv.container = {
			      inputBox : elm1,
			      selectBox: elm2
			  };
			  popupDiv.container.inputBox.bind('keydown',function(e){
				  if(e.which == 13){
				      //console.log(popupDiv.container.selectBox[0].selectedIndex);
				      popupDiv.empty();
				      
				      switch(popupDiv.container.selectBox[0].selectedIndex){
				      case 4:
					  // ########
					  // SEARCH
					  // ########
					  $.getJSON("1min_search.php?" + "q=" + encodeURIComponent(popupDiv.container.inputBox.val())
						    , function(data){
							var s = "";
							//console.log(data);
							var res = data;
							var rstr = "";

							var sd = new SelectDialog(enterFunc);
							popupDiv.append(sd.elm);

							for(var i = 0; i < data.length; i ++){
							    //console.log(data[i]);
							    //rstr += '- ' + data[i].title + '\n-- ' + data[i].url + '\n';
							    var ielm = $("<div>")
								.append($('<div>').text(data[i].title))
								.append(
									$('<div>')
									.append($('<a>').attr('href',data[i].url).text(data[i].url))
									.append($('<img>').attr('src','http://b.hatena.ne.jp/entry/image/'+data[i].url))
									);
							    var delm = $('<div>');
							    delm.data = '\n- ' + data[i].title + '\n-- ' + data[i].url + '\n';
							    var btn = $('<input type="button">').val('ok').bind('click',function(i){return function(){
									sd.select(i);
									sd.decide();
								    }}(i));
							    sd.add(delm.append(ielm).append(btn)); // thumb or mini
							}
							popupDiv.flickable();
						    });
					  break;
				      case 3:
					  // ########
					  // AMZ
					  // ########
					  
					  $.getJSON("amz.php?" + "q=" + encodeURIComponent(popupDiv.container.inputBox.val())
						    , function(data){
							var s = "";
							//console.log(data);
							var res = data;
							var sd = new SelectDialog(enterFunc);
							popupDiv.append(sd.elm);
							for(var i = 0; i < res.length; i ++){
							    //console.log(res[i].title);
							    var ielm = $('<div class="elm">')
								//.css('float','left')
								.append($('<div>').text(res[i].title[0]))
								.append(
									$('<img>').attr("src",res[i].mimage[0]).bind('load',function(){
										// これでいいのかなー？
										popupDiv.flickable();
									    })
									);

							    var delm = $('<div>');
							    delm.data = "{{amz "+res[i].asin[0] + " " + res[i].mimage[0] + " " + res[i].link[0] + ' '+ res[i].title[0] + "}}";
							    var btn = $('<input type="button">').val('ok').bind('click',function(i){return function(){
									sd.select(i);
									sd.decide();
								    }}(i));
							    sd.add(delm.append(ielm).append(btn)); // thumb or mini
							}
						    });
					  break;
				      case 2:
					  // ########
					  // GEO
					  // ########
					  var key = "HTVnMP6xg64qpUG.YGQFVZF3HDvwIpLceFv2l2mjNXaSP8.Jl.WdxnobX28CJNs-";
					  $.getJSON("http://geo.search.olp.yahooapis.jp/OpenLocalPlatform/V1/geoCoder?appid=" + key
						    + "&query=" + encodeURIComponent(popupDiv.container.inputBox.val())
						    + "&output=json"
						    + "&callback=?", function(data){
							var s = "";
							console.log(data);
							var res = data.Feature;
							var sd = new SelectDialog(enterFunc);
							popupDiv.append(sd.elm);
							for(var i = 0; i < res.length; i ++){
							    var tmp = res[i].Geometry.Coordinates.split(',');
							    var ielm = $('<div>')
								//.css('float','left')
								.append($('<div>').text(res[i].Property.Address))
								.append(
									$('<img>').attr("src","http://map.olp.yahooapis.jp/OpenLocalPlatform/V1/static?appid=" + key + "&lat=" + tmp[1] + "&lon=" + tmp[0]+"&width=200&height=200&z=11&pointer=on").bind('load',function(){
										// これでいいのかなー？
										popupDiv.flickable();
									    })
									);
							    var delm = $('<div>');
							    delm.data = "{{map "+tmp.join(' ') + " 10}}";
							    var btn = $('<input type="button">').val('ok').bind('click',function(i){return function(){
									sd.select(i);
									sd.decide();
								    }}(i));
							    sd.add(delm.append(ielm).append(btn));
							}
						    });
					  
					  break;
				      case 0:
					  // ########
					  // TWITPIC
					  // ########
					  $.getJSON("http://search.twitter.com/search.json?locale=ja&rpp=100&q=twitpic+"
						    + encodeURIComponent(popupDiv.container.inputBox.val())
						    + "&callback=?", function(data){
							var s = "";
							var res = data.results;
							var sd = new SelectDialog(enterFunc);
							popupDiv.append(sd.elm);
							for(var i=0;i<res.length;i++){
							    if(res[i].text.indexOf("http://twitpic.com/")!=-1){
								var m =res[i].text.match(/http:\/\/twitpic\.com\/([a-zA-Z0-9]+)/);
								var ielm = $("<img>").attr("src","http://twitpic.com/show/mini/"+m[1]).bind('load',function(){
									// これでいいのかなー？
									popupDiv.flickable();
								    });
								var delm = $('<div>');
								delm.data = "{{twitpic " + m[1] + "}}";;
								var btn = $('<input type="button">').val('ok').bind('click',function(i){return function(){
									    sd.select(i);
									    sd.decide();
									}}(i));
								sd.add(delm.append(ielm).append(btn)); // thumb or mini
							    }
							}
						    });
					  break;
				      case 1:
					  // ########
					  // FLICKR
					  // ########
					  // todo: => outer
					  var key = "fe95ba8a7a404e021ab0cf4442f2c89c";
					  var url = "http://api.flickr.com/services/rest/?"
					      + "&api_key=" + key
					      + "&method=flickr.photos.search&sort=relevance&per_page=50&extras=owner_name&license=1,2,3,4,5&format=json"
					      + "&text=" + encodeURIComponent(popupDiv.container.inputBox.val());
					  
					  $.getJSON(url + "&jsoncallback=?",function(data){
						  var s = "";
						  var res = data.photos.photo;
						  var sd = new SelectDialog(enterFunc);
						  popupDiv.append(sd.elm);
						  for(var i=0;i<res.length;i++){
						      var url = "http://farm"+res[i].farm+".static.flickr.com/"+res[i].server+"/"+res[i].id+"_"+res[i].secret+"_m.jpg";
						      var link = "http://www.flickr.com/photos/"+res[i].owner+"/"+res[i].id;
						      // _s or _m
						      var ielm = $("<img>").attr("src",url).bind('load',
												 function()
												 {
												     // これでいいのかなー？
												     popupDiv.flickable();
												 });
						      var delm = $('<div>');
						      delm.data = "{{flickr " + url +" " + link + " " + res[i].ownername + "}}";
						      var btn = $('<input type="button">').val('ok').bind('click',function(i){return function(){
								  sd.select(i);
								  sd.decide();
							      }}(i));
						      sd.add(delm.append(ielm).append(btn));
						  }
					      });
					  break;
				      }

				  }
			      });
			  $(document.body).append(popupDiv);
		      }else{
			  popupDiv.text("[" + selText + "]");
		      }
		      popupDiv.css('display','block');
		      //popupDiv.css('left','50%');
		      //popupDiv.css('top','0%');
		      popupDiv.container.inputBox.focus();

		      return false;
		  }
		  // ==================

	      }
	  });

      $('#savebtn').bind('click',function(){
	      save();
	  });
      $('#newbtn').bind('click',function(){
	      var title = encodeURIComponent(prompt("file name?"));
	      if(title){
		  document.location.hash = title;
		  init();
	      }
	      //alert("new");
	  });
      $('#junkbtn').bind('click',function(){
	      var d = new Date();
	      var title = "" + d.getFullYear()
		  +("0" + (1 + d.getMonth())).slice(-2)
		  +("0" + (d.getDate())).slice(-2);
	      document.location.hash = title;
	      init();
	  });
      init();
  }
  );
