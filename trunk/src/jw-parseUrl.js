//url 地址解析
	parseUrl:function(url){
		 //若是ie浏览器，相对地址 如 jquery/widget.html 并不能正常识别
		 if($.browser.msie){
			 var b=/^[A-Za-z]+:/;
			 if(!b.test(url)){
				 if(url.substring(0,1)!="/"){
					 url=location.protocol+"//"+location.host+location.pathname.substring(0,location.pathname.lastIndexOf("/")+1)+url;
				 }else{
					 url=location.protocol+"//"+location.host+url;
				 }
			 }
		 }
		 var a=document.createElement('a');
		 a.href=url;
		 var names=['href','protocol','host','hostname','port','pathname','search','hash'],
		     result={},
		      i;
			 for(i=0;i<names.length;i++){
				 result[names[i]]=a[names[i]];
			 }
		 result['query']=result['search'].replace(/^\?/,'');
		 a=names=null;
		 return result;
    },