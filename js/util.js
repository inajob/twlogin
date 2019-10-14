function getFirstLine(s){
	return s.split(/[\r\n]+/)[0];
}


function createXMLObject(XMLStr){
    //    var xmlhttp=false;
    //if(window.ActiveXObject){ /* IE5, IE6 */
    //xmlhttp=new ActiveXObject("Microsoft.XMLDOM"); /* MSXML2 */
    //xmlhttp.async = "false";
    //xmlhttp.loadXML(XMLStr);
    //alert(xmlhttp)
    //return xmlhttp;
    //}
if(window.DOMParser){
	return new DOMParser().parseFromString(XMLStr, 'text/xml');
    }
    else{return null;}
}

var rss = null;
function loadFileList(f, prefix){
    if(rss!=null){
	f();
	return;
    }
    prefix = prefix===undefined?"./":prefix;
    $.ajax({
	   type:'GET',
	   url:prefix + 'files.list',
	   cache:false,
	   success:function(text){
		rss = [];
		items = text.split("\n");
		for(var i=items.length - 1;i>=0;i--){
		    if(items[i]=="")continue;
		    var url = "data/" + items[i];
		    var r = /data\/([0-9]*):(.*)\.html/;
		    var m = url.match(r);
		    rss.push({
			    title:decodeURIComponent(m[2]),
				link:m[1] + encodeURIComponent(":")+encodeURIComponent(m[2])+'.html'
				});
		}
		f();
	    }
	});
}
function loadMenu(){
    loadFileList(function(){
	    for(var i=0;i<rss.length;i++){
		$('<div>').append(
				  $('<a>')
				  .text(rss[i].title)
				  .attr('href',
					rss[i].link
					)
				  )
		    .appendTo($('#menu_all'));
	    }
	})
}
function loadMenuWiki(){
    //if(window.ActiveXObject){ /* IE5, IE6 */
	/*
	$()
	var xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.open("GET", user_id + encodeURIComponent(':') + 'menu.html', false); 
	//xmlhttp.overrideMimeType("text/xml");
	xmlhttp.send(null); 
	*/

    //	var xml = xmlhttp.responseXML;
    //var body = xml.getElementsByTagName("pre");
		    //
		    //var dat =  body.firstChild.nodeValue;
		    //var menuParser = new WikiParser();
		    //menuParser.parse(dat,$('#menu_wiki')[0]);    
		    //afterProc($('#menu_wiki')[0]);

    //    }else{
	$.ajax({
		type:'GET',
		    url: user_id + encodeURIComponent(':') + 'menu.html',
		    cache:false,
		    success:function(html){
		    //var parser = new DOMParser();
		    html = html.split('\n').slice(1).join("\n");
		   var l = $(html);
		   for(var i = 0;i<l.length; i++ ){
			if(l[i].id=='body'){
				dat = l[i].innerHTML;
			}
		   }
		    //alert("Hello"+$(html)[6]);
		    //console.log($(html)[4].id);
		    //if($(html).length>5){
			//dat = ($(html)[6].innerHTML);
		    //}else{
			//dat = ($(html)[1].innerHTML);
		    //}
			//return;
			//var xml = createXMLObject(html);//parser.parseFromString(html, "text/xml");
		    //var body = xml.getElementsByTagName("pre")[0];
		    //var dat =  body.firstChild.nodeValue;
		    var menuParser = new WikiParser();
		    menuParser.parse(dat,$('#menu_wiki')[0]);    
		    afterProc($('#menu_wiki')[0]);
		}
	    });
	//}
}

function createMenu(){
	var menuWiki;

	var select = function(target){
	    $('#menu .menu-content').css('display','none');
	    $('#' + target).css('display', 'block');
	}

	$(document.body).append(
				$('<div id="menu" class="menu">')
				.append($('<ul class="tab">')
					.append($('<li>').text('all').bind('click',function(){
						    select("menu_all");
						}))
					.append($('<li>').text('wiki').bind('click',function(){
						    select("menu_wiki");
						}))
					)
				.append($('<br class="clbr" />'))
				.append($('<div class="menu-content" id="menu_all">'))
				.append(menuWiki = $('<div class="menu-content" id="menu_wiki">'))
				);
	select('menu_wiki');
	return menuWiki;
}

function loadCSS(url){
    if (document.createStyleSheet === undefined) {
		if (url) {
		    var el = document.createElement('link');
		    el.rel = 'stylesheet';
		    el.href = url;
		} else {
		    var el = document.createElement('style');
		}
		el.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(el);
    }
    else {
	document.createStyleSheet(url);
    }
}
