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
					.attr('href','../iconedit.html#'+stitle)
					.text('edit')));

	// create today
	buttons.append($('<div id="today">').text('today'));	
	buttons.append($('<br class="clbr" />'));

	var d = new Date();
	var title = "" + d.getFullYear()
	    +("0" + (1 + d.getMonth())).slice(-2)
	    +("0" + (d.getDate())).slice(-2);
	
	var label = $('#today').text();
	$('#today').empty();
	$('#today').append($('<a>').attr('href','../iconedit.html#' + title).text(label));

	// create menu
	//$(document.body).append($('<div id="menu">'));
	createMenu();
	
	//$('<div class="wiki-body">'+wikiParser.render(pre)+'</div>').appendTo(c);
	var e = $('<div>');
	var icon = new IconObj(5);
	icon.editable = false;
	icon.load(pre,e);
	e.appendTo(c);

	loadCSS('style.css'); // todo: wiki.css
	loadMenuWiki();
	
	$('<hr>').appendTo(document.body);
	$('<div class="footer">').html('karuki3 <a href="http://d.hatena.ne.jp/inajob/">inajob</a>').appendTo(document.body);
    });
