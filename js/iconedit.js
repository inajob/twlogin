var user;

function check(f){
    $.ajax({
	    type:"GET",
		url: "action.php?action=check",
		cache:false,
		success:function(text){
		if(text=="[]"){
		    // not log in
		    alert("logout now");
		    document.location="action.php?action=login";
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
    console.log(user);

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

		//wikiArea.value.value = body.firstChild.nodeValue;
		//wikiArea.redraw();
		icon = new IconObj(16);
		//icon.mkIcon($('#icon'));
		icon.load(body.firstChild.nodeValue,$('#icon'));
	    },
		error:function(){
		alert("notfound");
		$('#icon').empty();
		icon = new IconObj(16);
		icon.w = 16;
		icon.h = 16;
		icon.mkIcon($('#icon'));
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
    
    var param = {title:tt,body:icon.dump(),type:"icon"};
    //console.log(param);
    //return;
    $.ajax({
	    type:"POST",
		url: "action.php?action=save",
		data:param,
		success:function(text){
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
var icon;
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

$(
  function(){
      $('body').layout({
	      appDefaultStyles:true
		  });
      $('#savebtn').bind('click',function(){
	      save();
	  });
      $('#newbtn').bind('click',function(){
	      var title = prompt("file name?");
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
