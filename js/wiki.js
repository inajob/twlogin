wikiParser = {
    table:[
	["!!!","h3 style='clear:both'"],
	["!!","h2 style='clear:both'"],
	["!","h1 style='clear:both'"],
	["---","li","3ul"],
	["--","li", "2ul"],
	["-","li",  "1ul"],
	["#","embed"],
	["%","embed-u"]
    ],
    state:[
	   ["","ul",null,null],
	   ["/ul","","ul",null],
	   [null,"/ul","","ul"],
	   [null,null,"/ul",""]
	   ],
    render:function(s){
	function escapeHTML(s){

	    return s.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;');
	}
	function lineF(s){
	    // inline {{----}}
	    var pattern = new RegExp("\{\{([^\}]*?)\}\}","g");
	    var _match;
	    var index = 0;
	    var out = "";
	    var tmp;
	    while(_match = pattern.exec(s)){
		out += chgUrl(s.substring(index,pattern.lastIndex - _match[0].length));// + "@@" + _match[1] + "@@";
		tmp = _match[1].split(" ");
		if(tmp[0]=='icon'){
		    out += '<div class="embedurl" rel="'+escapeHTML(tmp[1])+'">'+'[[icon]]'+'</div>';
		}else{
		    out += _match[0];
		}
		index = pattern.lastIndex;
	    }
	    out += chgUrl(s.substring(index,s.length));
	    return out;
	}
	function chgUrl(s){
	    var url = /(http(|s):\/\/[^ ]*)/g;
	    s = escapeHTML(s);
	    s = s.replace(url,function(all){
		    return "<a style='word-break:break-all' href='"+all+"'>"+all+"</a>";
		})
	    return s;
	}
	var ls = s.split(/[\r\n]/);
	ret = "";
	var flag = false;
	var state = 0;
	var tag = "";
	for(var i= 0;i<ls.length;i++){
	    flag = false;
	    for(var j=0;j<this.table.length;j++){
		if(ls[i].indexOf(this.table[j][0])==0){
		    var nstate = this.table[j][2];
		    if(!nstate || nstate == undefined){ // not `li` style
			for(var k=0;k<state;k++){
			    ret+="</ul>";
			}
			nstate = 0;
		    }else{
			nstate = parseInt(nstate.charAt(0));
		    }
		    //tag = this.state[state][nstate];
		    //if(tag && tag!="")ret += "<"+tag+">";
		    tag = nstate - state;
		    if(tag>0){
			for(var l=0;l<tag;l++)ret += "<ul>";
		    }else if(tag<0){
			for(var l=tag;l<=-1;l++)ret += "</ul>";
		    }
		    state = nstate;
		    if(this.table[j][1]=="embed"){
			var fname = ls[i].slice(this.table[j][0].length,ls[i].length);
			ret += '<div class="imgframe" style="float:right;background-color:white;padding:1em;"><a href="http://twitpic.com/'+fname+'"><div><img src="http://twitpic.com/show/thumb/'+fname+'" />'+'</div><div>http://twitpic.com/'+fname+'</div></a></div>';
		    }else if(this.table[j][1]=="embed-u"){
			ret += '<div class="embedurl" rel="'+ls[i].slice(this.table[j][0].length,ls[i].length)+'">'+'[[include url]]'+'</div>';
		    }else{
			ret += "<" +this.table[j][1]+ ">" +lineF(ls[i].slice(this.table[j][0].length,ls[i].length))+ "</" +this.table[j][1]+ ">";
		    }
		    flag = true;
		    break;
		}
	    }
	    if(flag==false){
		for(var k=0;k<state;k++){ // doubling
		    ret+="</ul>";
		}
		nstate = 0;
		state = 0;
		ret += lineF(ls[i]) + "<br />"
	    }
	}
	return ret;
    }
}