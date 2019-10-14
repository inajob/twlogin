/*
karuki - livepreview
by inajob  ( http://d.hatena.ne.jp/inajob/ ) / @ina_ani
MIT Licence.
*/
(function(jQuery){
    function KarukiView(p){
	this.body = document.createElement("div");
	this.body.style.backgroundColor="#eee";
	this.body.className="wiki-body";
	this.body.style.padding="0px"; // override

	this.body.style.width="100%";//p.css("width");
	this.body.style.height=p.css("height");
	
	this.textarea = document.createElement("textarea");
	//this.textarea.id = p.id;

	this.textarea.style.width = "99%";
	var h = p.css("height");
	this.textarea.style.height = h;

	this.textareaDiv = document.createElement("div");
	this.textareaDiv.style.width = "49%";
	this.textareaDiv.style.height = "99%";
	this.textareaDiv.appendChild(this.textarea)

	this.previewArea= document.createElement("div");
	//this.previewArea.id = "karuki-preview-area-"+p.id;
	this.previewArea.className = "karuki-preview";
	this.previewArea.style.width = "50%";
	this.previewArea.style.height = p.css("height");
	
	this.previewArea.style.overflow="auto";

	this.previewContent = document.createElement("div");
	this.previewContent.style.width="100%";
	this.previewContent.style.marginBottom="100px";
	this.previewArea.appendChild(this.previewContent);
	
	jQuery(this.textareaDiv).css("float","left");
	jQuery(this.previewArea).css("float","right");

	this.body.appendChild(this.textareaDiv);
	this.body.appendChild(this.previewArea);

    }
    function resize(v,w,h){
	v.textarea.style.height = h + "px";
	v.textarea.style.width = (w/2) + "px";
    }
    
    jQuery.fn.karuki = function(options){
		var options = jQuery.extend({
			name:"karuki",
			init:undefined,
			redraw:undefined,
			engine:function(s){return null},
			postProc:function(e){}
			}, options);
		var $this = jQuery(this);
		//$this.remove();
		var view = new KarukiView($this);
		if(options.init!=undefined){
			options.init(view);
		}
		var pretxt = "";
		var redraw = function(){
		    var nowtxt = view.textarea.value;
		    if(pretxt != nowtxt){
			var ptxt = options.engine(nowtxt);
			if(ptxt != null)view.previewContent.innerHTML = ptxt;

			// insert?
			options.postProc(view.previewContent, nowtxt);
			pretxt = nowtxt;
		    }
		};
		if(options.redraw!=undefined){
			redraw = options.redraw;
		}
		jQuery(view.textarea).bind("keyup",function(){
			redraw(view,view.textarea.value);
			})
		$this.append(jQuery(view.body));
		//$this.remove();
		$this = jQuery(view.body);
		$this.redraw = function(){redraw(view,view.textarea.value);};
		$this.value = view.textarea  // karuki.text.value
		$this.preview = view.previewArea  // karuki.text.value
		$this.val = function(t){
			if(arguments.length==1){
				view.textarea.value = t;
				redraw(view);
			}
			return view.textarea.value
		}
		$this.resize = function(w,h){
			resize(view,w,h);
		}
		$this.hide = function(){
			view.textareaDiv.style.display="none";
			view.previewArea.style.width="100%";
		}
		$this.show = function(){
			view.textareaDiv.style.display="block";	
			view.previewArea.style.width="50%";
		}
		return $this
    }
})(jQuery);
