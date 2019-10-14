
var cache = new ElmCacher();
function loadIcon(e, name){
    var c = cache.get(name);
    $(e).text("");
    if(c!=undefined){
	var p = e.parentNode;
	//console.log(p);
	var nc = c.cloneNode(true);
	p.replaceChild(nc,e);
    }else{
	//console.log("hello: "+user_id + ':' + name + ".html");
	var fname = user_id + encodeURIComponent(':') + name + ".html";
	if(fname.indexOf(':')!=-1){
	    fname = name + ".html";
	}
	$.ajax({
		type:"GET",
		    url: fname,
		    cache:true,
		    success:function(html){
		    //var parser = new DOMParser();
		    var xml = createXMLObject(html);//parser.parseFromString(html, "text/xml");
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
var user_id;
var wikiParser = new WikiParser();

$(function(){
	function sfacebook(url){
	    return $('<div>').append($('<iframe>').attr('src','').attr('src','http://www.facebook.com/plugins/like.php?href='+encodeURIComponent(url)+'&layout=button_count&show_faces=true&width=120&action=like&colorscheme=light&height=21').attr('scrolling','no').attr('frameborder','0').css('border','none').css('overflow','hidden').css('width','120px').css('height','21px').attr('allowTransparency','true'));
	}
	function stweets(url){
	    return $('<div>').append($('<iframe>').attr('src','').attr('src','http://platform.twitter.com/widgets/tweet_button.html?'+'url='+encodeURIComponent(url)).attr('scrolling','no').attr('frameborder','0').css('border','none').css('overflow','hidden').css('width','120px').css('height','21px').attr('allowTransparency','true'));
	}

	$('#user').css('display','none');
	$('#type').css('display','none');
	$('#lastupdate').css('display','none');
	user_id = $('#user').text();
	var epre = $('pre')[0];
	var eh1= $('#title');
	var stitle = eh1[0].innerHTML; // = eh1.text();
	epre.style.display="none";
	var pre = epre.firstChild.nodeValue;
	// add H1
	$('<div class="title">').text(decodeURIComponent(eh1[0].innerHTML)).appendTo($(document.body));

	var c = $('<div class="content">');
	var buttons = $('<div class="buttons">');
	buttons.appendTo(c);

	c.appendTo($(document.body));

	// create rss
	buttons.append($('<div class="rss-button">')
		       .append($('<a>')
			       .attr('href','../rss.xml')
			       .append($('<img>').attr('src','../img/feed-icon-14x14.png'))
			       .append($('<span>').text('RSS'))
			       ));
	//buttons.append($('<div><a href="http://fusion.google.com/add?source=atgs&feedurl='
	//		 +encodeURIComponent(document.location.href.replace(/data\/[^\/]*\.html(|#)$/,'rss.xml'))
	//		 +'"><img src="http://buttons.googlesyndication.com/fusion/add.gif" border="0" alt="Add to Google"></a></div>'))

	buttons.append($('<div id="prev-page">').text('前の記事'));
	buttons.append($('<div id="next-page">').text('次の記事'));

    
	// create edit
	buttons.append($('<div id="edit">')
				.append($('<a>')
					.attr('href','../wikiedit.html#'+encodeURIComponent(stitle))
					.text('edit')));

	// create today
	buttons.append($('<div id="today">').text('today'));	
	//buttons.append($('<div id="onemin">').text('onemin'));	
	buttons.append($('<div id="junk">').text('junk'));



	// create dumpHTML
	var dumpDiv = null;
	buttons.append($('<div id="dump">').text('dump').bind('click',function(){
		    if(dumpDiv!=null){
			dumpDiv.empty();
			dumpDiv.remove();
			dumpDiv = null;
		    }
		    dumpDiv = $('<div>')
			.css({backgroundColor:"white",border:"solid 1px"})
			.append($('<div>').text(dd[0].innerHTML)).appendTo($(document.body));
		}));

	buttons.append($("<div>").append($('<a href="http://b.hatena.ne.jp/entry/" class="hatena-bookmark-button" data-hatena-bookmark-layout="standard" title="このエントリーをはてなブックマークに追加"><img src="http://b.st-hatena.com/images/entry-button/button-only.gif" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="http://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>')));
	buttons.append(sfacebook(document.location.href));
	buttons.append(stweets(document.location.href));
	buttons.append($('<div>').append($('<g:plusone size="medium"></g:plusone>')));

	
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
	/*
	buttons.append($('<button>').text('get')
		       .css('padding','5px')
		       .bind('click',function(){
			       $.ajax({
				       type:"GET",
					   url: '../1min_search.php?user='+user_id+'&page='+encodeURIComponent(stitle),
					   cache:true,
					   success:function(html){
					   alert(html);
				       },
					   error:function(){
					   alert('error 1min_search');
				       }
				   });
			   }));
	*/

	buttons.append($('<br class="clbr" />'));
	var d = new Date();
	var title = encodeURIComponent("/diary/" + d.getFullYear()
				       +("0" + (1 + d.getMonth())).slice(-2)
				       +("0" + (d.getDate())).slice(-2));
	// ==================================
	var label = $('#today').text();
	$('#today').empty();
	$('#today').append($('<a>').attr('href','../wikiedit.html#' + (title)).text(label));
	// ==================================

	var onemin = encodeURIComponent("/1min/" + d.getFullYear()
					+("0" + (1 + d.getMonth())).slice(-2)
				       +("0" + (d.getDate())).slice(-2));
	label = $('#onemin').text();
	$('#onemin').empty();
	$('#onemin').append($('<a>').attr('href','../wikiedit.html#' + (onemin)).text(label));
	// ==================================
	var junk = encodeURIComponent("/diary/" + d.getFullYear() +
					("0" + (1 + d.getMonth())).slice(-2) +
					("0" + (d.getDate())).slice(-2) +
					("0" + (d.getHours())).slice(-2) +
					("0" + (d.getMinutes())).slice(-2) +
					("0" + (d.getSeconds())).slice(-2)
					);
	label = $('#junk').text();
	$('#junk').empty();
	$('#junk').append($('<a>').attr('href','../wikiedit.html#' + (junk)).text(label));
	// ==================================
	// next-page
	loadFileList(function(){
		var target = -1;
		for(var i = 0;i < rss.length; i ++){
		    if(rss[i].title == stitle){
			target = i;
			break;
		    }
		}
		if(target > 0){
		    for(var i = target - 1;i >= 0; i --){
			if(rss[i].title.search(/^\/diary\//) != -1){
			    label = $('#next-page').text();
			    $('#next-page').empty();
			    $('#next-page').append($('<a>').attr('href',''+encodeURIComponent(user_id + ':' + encodeURIComponent(rss[i].title)) + '.html').text(label));
			    break;
			}
		    }
		}
	    });
	// ==================================
	// prev-page
	loadFileList(function(){
		var target = -1;
		for(var i = 0;i < rss.length; i ++){
		    if(rss[i].title == stitle){
			target = i;
			break;
		    }
		}
		if(target >= 0){
		    for(var i = target + 1;i < rss.length; i ++){
			if(rss[i].title.search(/^\/diary\//) != -1){
			    label = $('#prev-page').text();
			    $('#prev-page').empty();
			    $('#prev-page').append($('<a>').attr('href',''+encodeURIComponent(user_id + ':' + encodeURIComponent(rss[i].title)) + '.html').text(label));
			    break;
			}
		    }
		}

	    });
	
	
	// ==================================

	// create menu
	createMenu();

	loadMenu();

	var dd = $('<div class="wiki-body">');
	wikiParser.parse(pre,dd[0]);
	
	var cssc = new CSSC();
	var csscOut = [];
	if(wikiParser.cssString){
	    csscOut = cssc.parse(wikiParser.cssString);
	}
	// CSSを生成してあてる（ブラウザ別）
	if($.browser.msie){
	    var  newStyle = document.createStyleSheet();
	    //リストで与える
	    for(var i = 0; i < csscOut.length; i++){
		var ids = csscOut[i].ids;
		var attrs = csscOut[i].attrs;
		var tmp = "";

		for(var j = 0; j < attrs.length; j++){
		    newStyle.addRule(ids.join(' ') , attrs[j].name + ":" + attrs[j].value + " !important");
		}
	    }
	}else{
	    var newStyle = document.createElement('style');newStyle.type = "text/css";
	    document.getElementsByTagName('head').item(0).appendChild(newStyle);
	    // 文字で与える
	    
	    var sout = "";
	    for(var i = 0; i < csscOut.length; i++){
		var ids = csscOut[i].ids;
		var attrs = csscOut[i].attrs;
		var tmp = "";
		for(var j = 0; j < attrs.length; j++){
		    tmp += PrefixFree.prefixCSS(attrs[j].name + ':' + attrs[j].value) + ' !important;\n'
			}
		sout = ids.join(' ') + '{\n' + tmp + '}\n\n';
		console.log(sout);
		newStyle.sheet.insertRule(sout, newStyle.sheet.cssRules.length);		
	    }


	}

	afterProc(dd[0]);

	dd.appendTo(c);
	dd.append($('<br>').css('clear','both'));
	loadCSS('style.css'); // todo: wiki.css

	loadMenuWiki();

	$('<hr>').appendTo(document.body);
	
	
	var resultDiv = $('<div>')
	    .css('text-align','center')
	    .append($('<div>'));
	var searchInput;
	dd.append($('<hr>'));
	dd
	    .append(
		    $('<div>')
		    .css('text-align','center')
		    .append(searchInput = $('<input type="text">'))
		    .append(
			    $('<input type="button">')
			    .val('search')
			    .bind('click',function(){
				    var q = searchInput.val();
				    if(q == ""){
					alert("search null error");
					return;
				    }
				    resultDiv.empty();
				    $.ajax({
					    type:"GET",
						url: "../greptest.php?q=" + encodeURIComponent(searchInput.val()),
						cache:false,
						dataType:'json',
						success:
					    function(data){
						if(data.length==0){
						    alert("not found");
						    return;
						}
						for(var i = 0; i < data.length; i ++){
						    resultDiv.append(
								     $('<div class="search-result">')
								     .append(
									     $('<span>')
									     .append(
										     $('<a>').attr('href','../data/' + encodeURIComponent(data[i][0])).text(decodeURIComponent(data[i][0]))
										     )
									     )
								     .append($('<span>').text(data[i][1]))
								     );
						}
					    }});

				})
			    ))
	    .append(resultDiv);

	$('<hr>').appendTo(document.body);
	
	$('<div class="footer">').html('karuki3 <a href="http://d.hatena.ne.jp/inajob/">inajob</a>').appendTo(document.body);

    });
/*
if(console == undefined || console.logs == undefined){
    console ={log:function(){}};
    }*/
