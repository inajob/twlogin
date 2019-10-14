
$(function(){

	var documentType = $('#type').text();
	//console.log(documentType);
	$('<script>').attr('src','../js/keys.js').appendTo($(document.body));
	var scr = $('<script>').attr('src','http://www.google.com/jsapi?key=' + inajob.key.gkey).appendTo($(document.body));
	
	$('<script>').attr('src','../js/util.js').appendTo($(document.body));
	switch(documentType){
	case 'wiki':
	    
	    //$('<script>').attr('src','../js/mt.js').appendTo($(document.body));
	    //$('<script>').attr('src','../js/gin.js').appendTo($(document.body));
	    //$('<script>').attr('src','../js/fmc3.js').appendTo($(document.body));

	    $('<script>').attr('src','../js/gin.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/mt.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/mcl.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/render.js').appendTo($(document.body));
	    //$('<script>').attr('src','../js/mce.js').appendTo($(document.body));

	    $('<script>').attr('src','../js/cssc.js').appendTo($(document.body));

	    $('<script>').attr('src','http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML').appendTo($(document.body));
	    $('<script>').attr('src','https://cdn.rawgit.com/knsv/mermaid/0.5.8/dist/mermaid.min.js').appendTo($(document.body));
	    $("head").append("<link>");
	    var css = $("head").children(":last");
	    css.attr({
		    rel: "stylesheet",
			type: "text/css",
			href: "https://cdn.rawgit.com/knsv/mermaid/0.5.8/dist/mermaid.forest.css"
			});
		  $("head").append("<link>");
	    var css = $("head").children(":last");
	    css.attr({
		    rel: "stylesheet",
			type: "text/css",
			href: "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"
			});
	
	    
	    $('<script>').attr('src','../js/prefixfree.min.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/prefixfree.dynamic-dom.min.js').appendTo($(document.body));


	    /* hilighter */
	    $('<script>').attr('src','http://yandex.st/highlightjs/6.2/highlight.min.js').appendTo($(document.body));
	    $("head").append("<link>");
	    var css = $("head").children(":last");
	    css.attr({
		    rel: "stylesheet",
			type: "text/css",
			href: "http://yandex.st/highlightjs/6.2/styles/sunburst.min.css"
			});
	    
	    $('<script>').attr('src','../js/wiki_d.js?v3').appendTo($(document.body));
	    $('<script>').attr('src','../js/icon.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/elmCacher.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/wiki_karuki.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/wikistyle.js?v2').appendTo($(document.body));
	    
	    (function () {
		var head = document.getElementsByTagName("head")[0], script;
		script = document.createElement("script");
		script.type = "text/x-mathjax-config";
		script[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({\n" +
    "  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] },\n" +
    "  skipStartupTypeset:true"+
    "});"
		    head.appendChild(script);
		script = document.createElement("script");
		script.type = "text/javascript";
		script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
		head.appendChild(script);
	    })();
	    
	    break;
	case 'icon':
	    $('<script>').attr('src','../js/wiki_d.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/elmCacher.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/wiki_karuki.js').appendTo($(document.body));

	    $('<script>').attr('src','../js/icon.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/iconstyle.js').appendTo($(document.body));
	    break;

	case 'pic':
	    $('<script>').attr('src','../js/wiki_d.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/elmCacher.js').appendTo($(document.body));
	    $('<script>').attr('src','../js/wiki_karuki.js').appendTo($(document.body));

	    $('<script>').attr('src','../js/picstyle.js').appendTo($(document.body));
	    break;

	}
	
    });
