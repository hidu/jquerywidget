(function($){
	if(!$.browser.msie)return;
	var log=null;
	var i=0;		
	window.console={
	   log:function(msg){
		if(log==null) log=$('<div style="postion:absolute;width:300px;height:300px;overflow:scroll;"></div').appendTo(document.body);
		log.prepend("<div>"+i+++":"+$.param(msg)+"</div>");
	}
	};
})(jQuery);