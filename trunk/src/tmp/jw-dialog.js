 /**
	    *弹出框
	    *  .jw-dialog-title  可以不添加
	    * 在dialog 容器内的元素 具有 .close 属性 则click时 可以关闭该dialog
	    *@param id                需要以dialog 形式显示的层的 ID
	    *@param option.title      标题。当设置为false 时，不显示标题
	    *@param option.close      是否显示close 按钮
	    *@param option.max        是否显示最大化 按钮
	    *@param option.rel        ajax 页面的地址 或者为一个其他页面地址
	    *@param option.iframe     对上述rel 属性使用iframe 页面加载
	    *@param option.width      宽度(可以用%)
	    *@param option.height     高度(不使用%）
	    *@param option.fixed     是否允许dialog 随着页面滚动(一直居中)
	    *@param option.over      默认若为true,显示笼罩背景
	    *@param option.drag       是否允许拖动，默认允许
	    *@param option.maxFn      最大化事件
	    *@param option.closeFn    关闭事件
	    */
	  dialog:function(option){
	    	var op=option||{};
	    	option=$.extend({},{
		   	     width:400,
			     height:80,
			     close:true,
			     drag:true,
			     over:true,
			     title:''
			},op);
	        var _id="jw-dialog-"+new Date().getTime(),header;
	        var dialog=$("<table id='"+_id+"' class='jw-dialog'>" +
	        		"<tr class='jw-dialog-top-tr'><td><div class='jw-dialog-top-left'></div></td><td><div class='jw-dialog-top'></div></td><td><div class='jw-dialog-top-right'></div></td></tr>" +
	        		"<tr><td rowspan='2'><div class='jw-dialog-left'></div></td><td id='"+_id+"_hd' valign='top' class='jw-dialog-header'></td><td rowspan='2'><div class='jw-dialog-right'></div></td></tr>" +
	        		"<tr><td valign='top' id='"+_id+"_bd' class='jw-dialog-bd'></td></tr>" +
	        		"<tr class='jw-dialog-bottom-tr'><td><div class='jw-dialog-bottom-left'></div></td><td><div class='jw-dialog-bottom'></div></td><td><div class='jw-dialog-bottom-right'></div></td></tr>" +
	        		"</table>");
	        dialog.appendTo(document.body).hide();
	        option.over && this.over();
	        var body=$('#'+_id+"_bd",dialog);
	        var hd=$('#'+_id+"_hd",dialog);
	        var ww=$(window).width(),wh=$(window).height();
	        var isMax=false;
	        var that=this;
	        $(window).resize(function(){
	        	 ww=$(window).width();
	        	 wh=$(window).height();
	         });
	        
	        dialog.css({left:(ww-option.width)/2,top:0.75*wh/2+$(window).scrollTop(),width:380,height:140});
	        if(option.id){
	        	var _div=$(option.id);
	        	body.append(_div);
	        	toCenter(300,200);
	        }  
	       

	        if(option.title!==false){
	        	   var _div="<span><a href='javascript:;' ";
	              header="<div class='jw-dialog-title'><table style='width:100%'><tr><td>"+
	                         "<div class='jw-title'>"+(option.title||'')+"</div></td><td width='55px' style='text-align:right'><nobr>";
	             option.max!=false && (header+=_div+" class='max'>□</a></span>");
	             option.close!=false && (header+=_div+" class='close'>X&nbsp;</a></span>");
	             header+="</nobr></td></tr></table></div>";
	             header=$(header);
	             hd.append(header);
	         }
	        function setTitle(title){
	        	 option.title!==false && header.find('.jw-title').text(title);
	         }
	     	 var isSameDomain=(!!option.id ||!!option.rel) && !option.iframe;
	     	 if(!isSameDomain){
	     		 var _ifr_url=jw.parseUrl(option.iframe);
	     		isSameDomain=_ifr_url['hostname']==location.hostname;
	     		_ifr_url=null;
	     	 }
	        function setSize(width,height){
	        	((width+"").indexOf("%")>0) && (width=(ww*parseFloat(width)/100.0));
	        	((height+"").indexOf("%")>0) && (height=(wh*parseFloat(height)/100.0));
	        	
	        	autoBounds(width,height);
	        };
	           
	          function autoBounds(_w,_h){
	        	   var h=Math.min(Math.max(isSameDomain?(_h||dialog.height()):option.height,140),wh-5);
	     		   var w=Math.min(Math.max(isSameDomain?(_w||dialog.width()):option.width,140),ww);
		          var top=0.75*(wh-h)/2+$(window).scrollTop(),
		        	    left=(ww-w)/2+$(window).scrollLeft();
		             setBounds(top,left,w,h);
	           }
	           
	          function setBounds(top,l,width,height){
	        	  width=Math.min(width,ww);
	        	  height=Math.min(height,wh);
	        	  dialog.css({opacity:0.1}).show().animate({opacity:1,top:top,left:l,width:width});
	        	  if(isSameDomain && !option.iframe && !isMax){
	        		  body.css('height','auto');
	        	  }else{
	        		  body.animate({height:height});
	        	  }
	           }
	          
	          function setLocation(top,left){
	        	  dialog.animate({top:top,left:left});
	            }
	           
	          var last={},lastMaxClickTime=0;
	          function close(e){
	        	   if(e)e.stopPropagation();
	          	     that.over('close');
	          	     if( $.isFunction(option.closeFn) && false===option.closeFn()){
	          	    	 return false; 
	          	      };
	          	     body.empty().animate({height:0});
	          	     dialog.animate({top:wh/2,left:ww/2,width:0,height:0});
	               setTimeout(function(){dialog.remove();},250);;
	           }
	         
	           function max(e){
	        	   if(e)e.stopPropagation();
	        	   var cTime=new Date().getTime();
	        	   if(cTime-lastMaxClickTime<300){
	        				  return false;
	        		  }
	        	   lastMaxClickTime=cTime;
	        	   if(isMax){
	        		   isMax=false;
	        		   setBounds(last.top,last.left,last.width,last.height);
	        	   }else{
	        		   isMax=true;
		        	   last={top:dialog.offset().top,left:dialog.offset().left,width:dialog.width(),height:body.height()};
		        	   setBounds($(window).scrollTop(),1,ww,wh-(dialog.height()-body.height()));
	        	   }
	        	   var _max=header.find('.max');
	        	   isMax?_max.addClass('maxed'):_max.removeClass('maxed');
	        	   typeof option.maxFn=='function' && option.maxFn();
	            }
	          
	         function toCenter(w,h){
	        	 w=w||1;
	        	 h=h||1;
	        	 dialog.css({top:0.75*(wh-h)/2,left:(ww-w)/2,width:w+"px"});
	      	     body.height(h);
	          }
	         var ifr;
	         
	         if(option.rel){
	             body.empty().load(option.rel,function(){
	            	 dialog.css({opacity:0.1}).show();
	            	 var _h=Math.max(body.height(),op.height||0);
	            	 var _w=Math.max(dialog.width(),op.width||0);
	            	 toCenter(_w,_h);
	            	 autoBounds(_w,_h);
	            	});
	         }else if(option.iframe){
		         	ifr=$("<iframe class='jw-dialog-ifr iframe' src='"+option.iframe+"' style='width:100%;height:100%;border:0' frameborder=0 "+(option.iframeScroll?"":"scrolling=no")+" ></iframe>");
		         	ifr.appendTo(body);
		         	if(isSameDomain){
		         		_iframe_load();
		         	}else{
		         		toCenter();
		        		autoBounds();
		         	}
	         }else{
	        	 autoBounds();
	         }
	         //iframe load 事件 处理
	         function _iframe_load(){
	        	body.height(1);
	        	dialog.css({opacity:0.1}).show();
	    		ifr.load(function(){
	         		 var c=$(this).contents(),h=0,w=0;
	               if(!c)return;
	                 if(c.length>1){
		               c.find('.close').click(close).end().find('.max').click(max);
		               $('body',c).bind('close',close);
		               var it=c.attr('title');
		               if(it.length)setTitle(it);
		               dialog.width(300);
		               body.height(100);
		               h=Math.max(c.height()+10,op.height||0);
		               w=Math.max(c.width()+20,op.width||0);
		               var b=0;
		               if(h>wh){h=wh-52;};
		               if(w>ww){w=ww-10;};
		            	   dialog.css({left:ww/2,top:wh/2,width:"1px"});
		            	   setSize(w,h);
	                 }else{
	                	 setSize(option.width,option.height);
	                 }
	         	});
	          }
	        var fn=function(){autoBounds();dialog.is(":visiable")&&that.over();};
	        $(window).resize(fn);
	        option.fixed && $(window).scroll(autoBounds);
	        dialog.bind('close',close).find('.close').click(close).mousedown(close).end().find('.max').click(max).mousedown(max);
	        if(option.close!=false){
	        	$(window).keydown(function(e){
	        		e.keyCode==27 && close();
	        	});
	        }
	        option.drag && this.drag(header,dialog);
	        return {close:close,setSize:setSize,setBounds:setBounds,setLocation:setLocation,setTitle:setTitle};
	    },