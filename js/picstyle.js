$(function(){
	$('#user').css('display','none');
	$('#type').css('display','none');
	$('#lastupdate').css('display','none');
	user_id = $('#user').text();
	var epre = $('pre')[0];
	var eh1= $('title');
	var stitle = eh1.text();
	epre.style.display="none";
	var pre = epre.firstChild.nodeValue;
	
	// add H1
	$('<h1 class="title">').text(decodeURIComponent(stitle)).appendTo($(document.body));

	// ============================================
	var c = $('<div class="content">');
	var buttons = $('<div class="buttons">');
	buttons.appendTo(c);
	c.appendTo($(document.body));

	// create rss
	buttons.append($('<div>')
		       .append($('<a>')
			       .attr('href','../rss.xml')
			       .text('RSS')));
	// create edit
	buttons.append($('<div id="edit">')
				.append($('<a>')
					.attr('href','../picedit.html#'+encodeURIComponent(stitle))
					.text('edit')));

	// create today
	buttons.append($('<div id="today">').text('today'));	
	buttons.append($('<div id="onemin">').text('onemin'));	

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


	buttons.append($('<br class="clbr" />'));

	var d = new Date();
	var title = encodeURIComponent("/diary/" + d.getFullYear()
				       +("0" + (1 + d.getMonth())).slice(-2)
				       +("0" + (d.getDate())).slice(-2));

	var label = $('#today').text();
	$('#today').empty();
	$('#today').append($('<a>').attr('href','../wikiedit.html#' + (title)).text(label));


	var onemin = encodeURIComponent("/1min/" + d.getFullYear()
					+("0" + (1 + d.getMonth())).slice(-2)
				       +("0" + (d.getDate())).slice(-2));

	label = $('#onemin').text();
	$('#onemin').empty();
	$('#onemin').append($('<a>').attr('href','../wikiedit.html#' + (onemin)).text(label));
	
	// create menu
	createMenu();
	
	loadMenu();

	// ============================================
	
	var pos = pre.indexOf("\n");
	var addr = pre.slice(0,pos);
	var comment = pre.slice(pos + 1);
	var dd = $('<div class="wiki-body">');
	dd.append($('<div>').text(comment));
	$('<div>')
	    .css('text-align','center')
	    .append($('<img>').attr('src',addr)).appendTo(dd);
	dd.appendTo(c);
	dd.append($('<br>').css('clear','both'));
	loadCSS('style.css'); // todo: wiki.css

	loadMenuWiki();

	$('<hr>').appendTo(document.body);
	$('<div class="footer">').html('karuki3 <a href="http://d.hatena.ne.jp/inajob/">inajob</a>').appendTo(document.body);

    });
