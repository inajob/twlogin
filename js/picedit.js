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
    var params = hash.split('&');
    if(params.length == 2){
	hash = params[0];
    }
    if(hash==""){
	hash = prompt('input pagename');
    }
    if(hash.indexOf(':')==-1){
	hash = user.user_id+ ":"+hash;
    }
    console.log(hash);
    return hash;
}
function getAddr(){
    var hash = document.location.hash.replace("#","");
    var params = hash.split('&');
    if(params.length == 2){
	hash = params[1];
    }else{
	hash = "";
    }
    return hash;
}

function load(title){
    $.ajax({
	    type:"GET",
		url: "data/" + title + ".html",
		cache:false,
		success:function(html){
		var parser = new DOMParser();
		var xml = parser.parseFromString(html, "text/xml");
		var body = xml.getElementsByTagName("pre")[0].firstChild.nodeValue;
		var type = xml.getElementById("type").firstChild.nodeValue;
		if(type != 'pic'){
		    // error
		    alert("not pic type");
		    //document.location = 
		    return;
		}
		var pos = body.indexOf("\n");
		var addr = body.slice(0,pos);
		var comment = body.slice(pos + 1);
		$('#addr').val(addr);
		$('#body').val(comment);
		reload();
	    },
		error:function(){
		alert("notfound");
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
    var param = {title:tt,body:$('#addr').val() + '\n' + $('#body').val(),type:"pic"};
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
var title ;
var addr;
function init(){
    check(function(){
	      title = getTitle();
	      addr = getAddr();
	      $('#title').val(title);
	      $('#addr').val(addr);
	      
	      reload();
	      
	      load(encodeURIComponent(title));
	      htitle();
	  });
}
function reload(){
	      $('#pic').empty();
	      $('#pic').append($('<img>').attr('src',$('#addr').val()));
}
function htitle(){
    $('#title').empty();
    $("#title")
	.append($('<a>')
		.attr("href","data/"+encodeURIComponent(title)+".html")
		.text(decodeURIComponent(title)));
}

var wikiArea;
$(
  function(){
      $('body').layout({
	      appDefaultStyles:true,
		  east__size:$(document.body).width()/2
		  });
      $('#savebtn').bind('click',function(){
	      save();
	  });

      $('#addr').bind('keydown',function(e){
	      reload();
	  });
      init();
  }
  );
