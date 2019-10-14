WikiParser = function(){
    this.cache = [];
    this.ecache = [];
    this.cssString = "";
};
WikiParser.prototype = {
    // line mode
    type:{SINGLE:0,LIST:1},
    table:[
	   ["!!!", "h3", 0],
	   ["!!", "h2", 0],
	   ["!", "h1", 0],
	   ["---", "li", 1, 3],
	   ["--", "li", 1, 2],
	   ["-", "li", 1,  1],
	   ["#", "embed", 0],
	   ["%", "embed-u", 0],
	   [">>", "#block", 0],
	   ["|", "#table", 2]
    ],
    //cache:[],
    //ecache:[],
    parse:function(s,base){
	if(base==undefined){
	    base = document.body;
	}
	function escapeHTML(s){
	    return s.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;');
	}
	function escapeHTML2(s){
	    return s.replace(/>/g,'&gt;').replace(/</g,'&lt;');
	}
	function lineF(s){
	    // inline {{----}}
	    var pattern = new RegExp("\{\{([^\}]*?)\}\}","g");
	    var _match;
	    var index = 0;
	    var out = "";
	    var tmp;
	    var cred;
	    while(_match = pattern.exec(s)){
		out += chgUrl(s.substring(index,pattern.lastIndex - _match[0].length));// + "@@" + _match[1] + "@@";
		tmp = _match[1].split(" ");

		if(tmp[0]=='icon'){
		    out += '<div class="embedurl" rel="'+escapeHTML(tmp[1])+'">'+'[[icon]]'+'</div>';
		}else if(tmp[0]=='link'){
		    cred = tmp.slice(2).join(" ");
		    out += '<a href="#" class="link" rel="'+encodeURIComponent(tmp[1])+'">' +cred+ '</a>';
		}else if(tmp[0]=='imgupload'){
		    cred = tmp.slice(2).join(" ");
		    if(tmp.length >= 3){
			cred = parseFloat(tmp[2]) + "%";
		    }else{
			cred = "100%";
		    }
		    out += '<div><img width="'+cred+'" height="'+cred+'" src="http://inajob.dip.jp/dev/uploader/img/'+tmp[1]+'"></div>';
		}else if(tmp[0]=='img'){
		    cred = tmp.slice(2).join(" ");
		    out += '<div><img src="'+tmp[1]+'"></div>';
		}else if(tmp[0]=='twitpic'){
		    // id credit
		    cred = tmp.slice(2).join(" ");
		    out += '<div class="embedtwitpic" rel="'+escapeHTML(tmp[1]) + " " + cred+'">' + '[[twitpic]]' + '</div>';
		}else if(tmp[0]=='draws'){
		    // id credit
		    cred = tmp.slice(2).join(" ");
		    out += '<div class="embeddraws">' + '<a href="http://inajob.no-ip.org:10080/draws/view.html?'+parseInt(tmp[1])+'">' + '<img src="http://inajob.no-ip.org:10080/draws/data/'+parseInt(tmp[1])+'.png" />' + '</a></div>';
		}else if(tmp[0]=='flickr'){
		    // img url credit
		    cred = tmp.slice(3).join(" ");
		    if(tmp.length>=3){
			out += '<div class="embedflickr" rel="'+escapeHTML(tmp[1]) + ' ' + escapeHTML(tmp[2]) + ' ' + cred +'">' + '[[flickr]]' + '</div>';
		    }else{
			out += "[[unknown format]]";
		    }
		}else if(tmp[0]=='map'){
		    // id credit
		    //cred = tmp.slice(2).join(" ");
		    out += '<div class="embedmap" rel="'+escapeHTML(tmp[1]) + " " + escapeHTML(tmp[2]) + " " + escapeHTML(tmp[3]) +'">' + '[[map]]' + '</div>';
		}else if(tmp[0]=='amz'){
		    // id credit
		    cred = tmp.slice(4).join("_");
		    out += '<div class="embedamz" rel="'+escapeHTML(tmp[1]) + " " + escapeHTML(tmp[2]) + " " + escapeHTML(tmp[3]) + " " + escapeHTML(cred) +'">' + '[[amz]]' + '</div>';
		}else if(tmp[0]=='ls'){
		    if(tmp.length>=3){
			out += '<div class="embedls" rel="'+escapeHTML(tmp[1])+" "+escapeHTML(tmp[2]) +'">' + '[[ls]]' + '</div>';
		    }else{
			out += '<div class="embedls" rel="'+escapeHTML(tmp[1]) +'">' + '[[ls]]' + '</div>';
		    }
		}else if(tmp[0]=='rss'){
		    if(tmp[2]==undefined)tmp[2] = "10";
		    out += '<div class="embedrss" rel="'+escapeHTML(tmp[1]) + " " + escapeHTML(tmp[2]) +'">' + '[[rss]]' + '</div>';

		}else if(tmp[0] == 'embed'){
		    out += '<div class="embedoembed" rel="'+escapeHTML(tmp[1]) + '">' + '[[oembed ' + escapeHTML(tmp[1]) + ']]' + '</div>';
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
		    all = escapeHTML2(all);
		    return "<a style='word-break:break-all' href='"+all+"'>"+all+"</a>"
		    +' <a href="http://b.hatena.ne.jp/entry/'+ all +'">'
		    +'<img src="http://b.hatena.ne.jp/entry/image/'+all+'" />'
		    +'</a>';
		})
	    return s;
	}
	var lines = s.split(/[\r\n]/);
	var i,j,k;
	var parsedLines = [];
	var hit;
	var mode = -1;
	var lineBuf = [];
	var tmp;
	var tmp2;
	var tmp3;
	var name = "";
	
	for(i = 0; i < lines.length; i++){ // lines
	    hit = false;
	    for(j = 0; j < this.table.length; j++){ // haad-tag table
		if(lines[i].indexOf(this.table[j][0]) == 0){
		    if(mode == 1 && this.table[j][2] == mode){
			// list mode continue
			lineBuf[1].push([this.table[j], lines[i].slice(this.table[j][0].length)]);
		    }else if(this.table[j][2] == 1){
			// first list mode
			lineBuf = [1, [[this.table[j], lines[i].slice(this.table[j][0].length)]]];
			parsedLines.push(lineBuf); // tagged
		    }else{
			if(this.table[j][1] == "#block"){
			    tmp3 = lines[i].match(/^>>([^ ]*)(| .*)$/); // HERE, OTHER
			    tmp2 = tmp3[2].slice(1).split(/[ ]+/); // ブロックの引数をばらす
			    console.log(tmp3);
			    tmp = [0, ["","pre",0], ""];
			    name = tmp3[1];
			    if(tmp2[0] == 'quote'){  // quote
				tmp = [0, ["","blockquote",0], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }else if(tmp2[0]=='mce3'){ // magical circle
				tmp = [0, ["","mce",0], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }else if(tmp2[0]=='mce4'){ // magical circle
				tmp = [0, ["","mce2",0], ""];
			    }else if(tmp2[0]=='mermaid'){ // magical circle
				tmp = [0, ["","mermaid",0], ""];
			    }else if(tmp2[0]=='math'){ // mathjax
				tmp = [0, ["","math",0], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }else if(tmp2[0]=='styled'){
				tmp = [0, ["","div",0,tmp2.length>1?tmp2[1]:''], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }else if(tmp2[0]=='css'){
				tmp = [0, ["","css",0,tmp2.length>1?tmp2[1]:''], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }else if(tmp2[0]=='code'){
				tmp = [0, ["","code",0,tmp2.length>1?tmp2[1]:''], ""];
				//name = tmp2.length>=2?tmp[1]:'';
			    }
			    i++;
			    for(; i < lines.length; i++){ //装飾なし
				if(
				   lines[i].indexOf("<<" + name) == 0
				   
				   ){  // 終了の検知
				    if(tmp[2][tmp[2].length - 1] == "\n"){
					tmp[2] = tmp[2].slice(0, tmp[2].length - 1); // rstrip
				    }
				    break; //ヒアドキュメント風
				}
				tmp[2] += lines[i] + "\n";
			    }
			    parsedLines.push(tmp);
			}else if(this.table[j][1] == "#table"){
			    // table
			    if(mode == 2){
				lineBuf[1].push([this.table[j], lines[i].slice(this.table[j][0].length)]);
			    }else{
				lineBuf = [2, [
					       // tag-struct, text
					       [this.table[j], lines[i].slice(this.table[j][0].length)]
					       ]];
				parsedLines.push(lineBuf); // tagged		    
			    }
			}else{
			    parsedLines.push([0, this.table[j], lines[i].slice(this.table[j][0].length)]); // tagged
			}
		    }
		    
		    mode = this.table[j][2];
		    hit = true;
		    break;
		}
	    }
	    if(hit == false){
		parsedLines.push([0, ['','',0], lines[i]]); // normal line
		mode = -1;
	    }
	}
	delete lines;
	// parse complete

	
	//console.log(parsedLines);
	var text;
	var tag;
	var level;
	var elm,te,te2;
	var l;
	//var base = document.createElement('div');
	//console.log(base);
	/*
	var fMulti = function(l,e){
	    var li;
	    var te;
	    for(var i = 0; i < l.length; i++){
		if(l[i] instanceof Array){
		    // in
		    te = document.createElement('ul');
		    e.appendChild(te);
		    fMulti(l[i],te);
		    
		}else{
		    li = document.createElement('li');
		    // todo: escapeHTML
		    li.innerHTML = l[i];
		    e.appendChild(li);
		}
	    }
	}
	*/
	var eq = function(a,b){
	    if(a instanceof Array && b instanceof Array){
		if(a.length != b.length)return false;
		for(var i = 0; i < a.length; i++){
		    if(eq(a[i],b[i]) == false)return false;
		}
	    }else if(a==b){
		return true;
	    }else{
		return false;
	    }
	    return true;
	}

	// [0 or 1,string]  formatted?,endtag
	for(i = 0; i < parsedLines.length; i++){
	    var item = parsedLines[i];
	    if(item[0] == 0){
		// single
		// this.cache[i] ~= lineParser[i] ? continue
		if(eq(this.cache[i],item)){
		    continue;
		}

		te2 = this.ecache[i];//document.getElementById("wiki" + i);
		elm = document.createElement('div');
		//console.log(te2);
		if(te2){
		    te2.parentNode.replaceChild(elm, te2);
		}else{
		    base.appendChild(elm);
		}
		this.ecache[i] = elm;
		tag = item[1][1];
		if(tag==""){
		    // not tag
		    if(item[2] == ""){
			elm.innerHTML = '<br/>';
		    }else{
			elm.innerHTML = lineF(item[2]);
		    }
		}else if(tag=="mce"){
		    te2 = document.createElement("div");
		    te2.className = "embedmce3";
		    te2.style.border="solid";
		    te2.mce = item[2]
		    elm.appendChild(te2);
		}else if(tag=="mce2"){
		    te2 = document.createElement("div");
		    te2.className = "embedmce4";
		    te2.style.border="solid";
		    te2.mce = item[2]
		    elm.appendChild(te2);
		}else if(tag=="mermaid"){
		    te2 = document.createElement("pre");
		    te2.className = "embedmermaid";
		    te2.style.border="solid";
			  var tn = document.createTextNode(item[2]); //todo: exists IE not nextline pattern;
        te2.appendChild(tn);
		    elm.appendChild(te2);

		}else if(tag=="math"){
		    te2 = document.createElement("div");
		    te2.className = "embedmath";
		    te2.style.border="solid";
        te2.appendChild(document.createTextNode(item[2]));
		    // ちょっと困る
        // todo:本当はwiki_karuki.jsに書いたほうが良い
		    setTimeout(function(target){return function(){
				//console.log("regist" + te2.innerHTML);
				MathJax.Hub.Queue(["Typeset",MathJax.Hub,target]);
				console.log("typeset");
				//MathJax.Hub.Typeset(target);
			    }}(te2),1000);
		    elm.appendChild(te2);
		}else if(tag=="css"){
		    // 要素追加は無し
		    this.cssString += item[2];
		}else if(tag=="code"){
		    te2 = document.createElement("pre");
		    te2.className = "embedcode";
		    te2.style.border="solid";

		    elm.appendChild(te2);
        // todo:本当はwiki_karuki.jsに書いたほうが良い
		    setTimeout((function(te2,s,name){return function(){
				te2.innerHTML = hljs.highlight(name,s).value;
			    }
			    })(te2,item[2],item[1][3]),1000);
		}else{
		    // create tag
		    te2 = document.createElement(tag);
		    if(item[1].length>=3 && item[1][3]!=""){
			te2.className = item[1][3];
		    }
		    if(tag=="pre"){
			//if(document.all){
			var tn = document.createTextNode(item[2]); //todo: exists IE not nextline pattern;
			    te2.appendChild(tn);
			    //}else{ // IE doesnt enter?
			    //te2.innerHTML = escapeHTML(item[2]);
			    //}
		    }else if(tag=="div"){
			var wp = new WikiParser();
			//te2.innerHTML = 
			wp.parse(item[2],te2);
		    }else if(tag=="h1"){
			$(te2).css('clear','both');
			te2.innerHTML = lineF(item[2]);
		    }else{
			te2.innerHTML = lineF(item[2]);
		    }
		    elm.appendChild(te2);
		}
		//console.log(item[1][1] + ' ' + item[2]);
	    }else if(item[0] == 1){
		//multi
		// this.cache[i] ~= lineParser[i] ? continue
		if(eq(this.cache[i],item)){
		    continue;
		}

		level = 0;
		te2 = this.ecache[i];//document.getElementById("wiki" + i);
		elm = document.createElement('div');
		if(te2){
		    te2.parentNode.replaceChild(elm, te2);
		}else{
		    base.appendChild(elm);
		}
		this.ecache[i] = elm;
		
		te = [elm];
		//fMulti(item[1], elm);
		
		for(j = 0; j < item[1].length; j++){
		    //0-symbol 1-tag 2-signle/multi 3-label
		    text = item[1][j][1];
		    l = item[1][j][0][3];
		    //console.log(item[1][j][0][1] + ' ' + item[1][j][0][3] + ' ' + text);
		    //console.log("level:" + level + ' l:' + l);
		    if(level < l){ // in
			te2 = document.createElement("ul");
			te[te.length - 1].appendChild(te2);
			te.push(te2);
			te2 = document.createElement("li");
			te2.innerHTML = lineF(text);
			te[te.length - 1].appendChild(te2);
		    }else if(level == l){
			te2 = document.createElement("li");
			te2.innerHTML = lineF(text);
			te[te.length - 1].appendChild(te2);
		    }else{ // level > l
			te2 = level - l;
			for(k = 0; k < te2; k++){
			    te.pop();
			}
			te2 = document.createElement("li");
			te2.innerHTML = lineF(text);
			te[te.length - 1].appendChild(te2);
		    }
		    level = l;
		}
		//console.log(te);
	    }else if(item[0] == 2){ // table
		// mk table tag
		//multi
		// this.cache[i] ~= lineParser[i] ? continue
		if(eq(this.cache[i],item)){
		    continue;
		}
		te2 = this.ecache[i];
		elm = document.createElement('table');
		te =  document.createElement('tbody');
		elm.appendChild(te);
		//console.log(te.appendChild);
		if(te2){
		    te2.parentNode.replaceChild(elm, te2);
		}else{
		    base.appendChild(elm);
		}
		this.ecache[i] = elm;
		//te = [elm];
		for(j = 0; j < item[1].length; j++){
		    //0-symbol 1-tag 2-signle/multi 3-label
		    text = ""+item[1][j][1];
		    te2 = document.createElement("tr");
		    te.appendChild(te2);
		    tmp2 = text.split("|");
		    for(k = 0; k < tmp2.length; k++){
			tmp = document.createElement("td");
			tmp.innerHTML = tmp2[k];
			te2.appendChild(tmp);
		    }
		}
	    }
	}

	if(this.cache.length >= i){
	    for(j = this.cache.length - 1; j >= i ; j--){
		//console.log(this.ecache[j])
		te2 = this.ecache[j].parentNode;
		te2.removeChild(this.ecache[j]);
		this.ecache[j] = null;
	    }
	}
	this.cache = parsedLines;
	//document.body.appendChild(base);
    }
}
