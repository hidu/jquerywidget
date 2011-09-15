
(function($){
	window.jw=window.jw||{};
	if(window.jw.version)return;
	
	window.jw={
	version: "1.0",
    
    //tab 选项卡
    tab:function(headItems, contentItems,fn) {
		var C = $(headItems), B = $(contentItems);
		C.click(function(e) {
			var i = C.index(this);
			C.removeClass("cur");
			$(this).addClass("cur");
			if(fn && $.isFunction(fn)){
				if(fn(i,this,e)===false)return false;
			}
			B.hide().eq(i).show();
		});
		if(C.filter('.cur').size()<1)C.eq(0).addClass("cur");
		C.filter('.cur').trigger('click');
	},
	
	//笼罩层
	over:function(opt){
		opt=opt||'show';
		var over,wh=$(window).height(),bh=$('body').outerHeight();
		if(opt=='show'){
			if($('.jw-over').length)return;
			over=$('<div class="jw-over" ></div>');
			$().ready(function(){
				$(document.body).append(over);
				$('html').addClass('jw-over-hidden');
				(typeof $.fn.bgiframe=='function') && over.bgiframe();
				over.height(bh+wh);
			});
		}else{
			$('html').removeClass('jw-over-hidden');
			setTimeout(function(){$('.jw-over').remove();},1);
		}
	},
	
	//使ie6 支持 position fixed
	position_fixed:function(target,win){
		target=$(target);
		win=win||window;
		var ie6=$.browser.msie && $.browser.version<=6; 
		if(!ie6){
			target.css({position:'fixed'});
    		return true;
		}
		target.css({position:'absolute'});
		var bottom=parseInt(target.css('bottom'));
		var top=parseInt(target.css('top'));
		function listen(){
			if(bottom){
    			target.css('top',($(win).height()+$(win).scrollTop()-bottom-40)).show();
			}else{
    			target.css('top',($(win).scrollTop()+top)).show();
			}
		}
		$(win).scroll(listen).resize(listen);
		listen();
	},
	
	
	 //控件拖动支持
	 drag:function(bar,target,win){
	     var b=$(bar),t=target?$(target):b,x,y,moving=false,opacity,zi;
	      var _p=t.css('position');
	      if(_p!='absolute' && _p!='fixed'){
	    	  t.css('position',"absolute");
	      }
	      win=win||window;
		  var ifr=t.find('iframe'),over=null;
	      b.mousedown(function(e){
	    	  zi=zi||t.css('z-index');
	    	  opacity=opacity||t.css('opacity')||1.0;
	            x= e.clientX;
	            y= e.clientY;
	            moving=true;
	            _p=t.css('position');
				  b.css('cursor', 'move');
	            t.css({'opacity':opacity*0.7,'z-index':90000});
	            if(ifr){
	            	//通过使用timeout修正当窗体大小发生变化时，iframe的高度需要时变化后的高度以保证当前鼠标不进入iframe中
	            	setTimeout(function(){
	          		  var h=ifr.height();
	          		  over=("<div class='jw-drag-over' style='position: relative;width:100%;height:"+h+"px;margin-top:-"+h+"px;'></div>");
	          		  over=ifr.after(over).next('.jw-drag-over');
	            	},1);
	          	  };
	        return false;    
	      }).mouseup(stop);
	      $(win.document.body).mousemove(function(e1){
	    	  if(moving){
	    		  var offset=t.offset();
	    		  if(_p=='fixed'){
	    			  offset={top:offset.top-$(win).scrollTop(),left:offset.left-$(win).scrollLeft()};
	    		  }
	    		  t.css({top:offset.top+(e1.clientY-y),left:offset.left+(e1.clientX-x)});
	    		  x=e1.clientX;
	    		  y=e1.clientY;
	    	  }
	    	  return false;
	      }).mouseup(stop);
	      function stop(e){
	         moving=false;
			  b.css('cursor', 'default');
	         t.css({'opacity':opacity,'z-index':zi});
	         over && over.remove();
	         return false;
	      }
	 },
	 
	   /**
	    *弹出框
	    * 在dialog 容器内的元素 具有 .close 属性 则click时 可以关闭该dialog
	    *@param id                需要以dialog 形式显示的层的 ID
	    *@param option.title      标题。当设置为false 时，不显示标题
	    *@param option.close      是否显示close 按钮
	    *@param option.max        是否显示最大化 按钮
	    *@param option.rel        ajax 页面的地址 或者为一个其他页面地址
	    *@param option.iframe     对上述rel 属性使用iframe 页面加载
	    *@param option.width      宽度(可以用%)
	    *@param option.height     高度(不使用%）
	    *@param option.fixed     是否允许dialog 随着页面滚动
	    *@param option.over      默认若为true,显示笼罩背景
	    *@param option.drag       是否允许拖动，默认允许
	    *@param option.onMax      最大化事件
	    *@param option.onClose    关闭事件
	    */
	  dialog:function(option){
	    	var op=option||{};
	    	option=$.extend({},{
		   	     width:300,
			     height:100,
			     close:true,
			     drag:true,
			     over:true,
			     fixed:true,
			     title:'',
			     iframeScroll:true,
			     iframeFetchTitle:true,
			     zIndex:301,
			     onLoad:function(){},
			     target:window
			},op);
	    	var win=option.target;
	    	var ww=$(win).width(),wh=$(win).height();
	        var _id="jw-dialog-"+new Date().getTime(),header;
	        var _style="top:"+(0.75*wh/2+$(win).scrollTop())+"px;left:"+(ww/2+$(win).scrollLeft())+"px;width:1px;height:1px";
	        var dialog="<div class='jw-dialog' id='"+_id+"' style='"+_style+"'><div class='jw-dialog-hd'></div><div class='jw-dialog-bd'></div></div>";
	        _style=null;
	        dialog=$(win.document.body).append(dialog).find("#"+_id);
	        option.over && this.over();
	        var bd=$('.jw-dialog-bd',dialog);
	        var hd=$('.jw-dialog-hd',dialog);
	        var isMax=false;
	        var that=this;
	        var th=hd.outerHeight();//hd的高度
	        $(win).resize(function(){
	        	 ww=$(win).width();
	        	 wh=$(win).height();
	         });
	        setTimeout(function(){
		        dialog.css('z-index',option.zIndex);
     	        setSize(option.width,option.height);
	         },0);
	        if(option.id){
    	        	bd.append(option.id);
    	        	autoBounds();
	         }
	       
	        if(option.title!==false){
	        	   var _div="<span><a href='javascript:;' ";
	              header="<table width='100%'><tr><td>"+
	                         "<div class='jw-title'>"+(option.title||'&nbsp;')+"</div></td><td style='width:55px;text-align:right'><nobr>";
	             option.max!=false && (header+=_div+" class='max'>□</a></span>");
	             option.close!=false && (header+=_div+" class='close'>X&nbsp;</a></span>");
	             header+="</nobr></td></tr></table>";
	             header=hd.append(header).find('table');
	         }
	        function setTitle(title){
	        	 option.title!==false && header.find('.jw-title').text(title);
	         }
	     	
	        function setSize(width,height){
	        	((width+"").indexOf("%")>0) && (width=(ww*parseFloat(width)/100.0));
	        	((height+"").indexOf("%")>0) && (height=(wh*parseFloat(height)/100.0));
	        	autoBounds(width,height);
	        };
	           
	          function autoBounds(_w,_h){
	        	   var h=Math.min(Math.max(_h||0,option.height,140),wh-5-th);
	     		   var w=Math.min(Math.max(_w||0,dialog.width(),option.width,300,bd.width()),ww);
		          var top=0.75*(wh-h)/2+$(win).scrollTop(),
		        	    left=(ww-w)/2+$(win).scrollLeft();
		             setBounds(top,left,w,h);
	           }
	           
	          function setBounds(top,l,width,height){
	        	 if(!width || !height)return;
	        	  width=Math.min(width,ww);
	        	  height=Math.min(height,wh-th);
	        	  dialog.animate({top:top,left:l,width:width,height:height+th});
	        	  if(!option.iframe && !isMax){
	        		  bd.css('height','auto');
	        	  }else{
	        		  bd.animate({height:height});
	        	  }
	           }
	          
	          function setLocation(top,left){
	        	  dialog.animate({top:top,left:left});
	            }
	           
	          var last={},lastMaxClickTime=0;
	          function close(e){
	        	     if(e)e.stopPropagation();
	          	     that.over('close');
	          	     if( $.isFunction(option.onClose) && false===option.onClose()){
	          	    	 return false; 
	          	      };
	          	     dialog.animate({top:wh/2,left:ww/2,width:0,height:0},function(){
	          	    	dialog.remove();
	          	     });
	           }
	         
	           function max(e){
	        	   if(e)e.stopPropagation();
	        	   var cTime=new Date().getTime();
	        	   if(cTime-lastMaxClickTime<300)return false;
	        	   lastMaxClickTime=cTime;
	        	   if(isMax){
	        		   isMax=false;
	        		   setBounds(last.top,last.left,last.width,last.height);
	        	   }else{
	        		   isMax=true;
		        	   last={top:dialog.offset().top,left:dialog.offset().left,width:dialog.width(),height:bd.height()};
		        	   setBounds($(win).scrollTop(),1,ww,wh-th);
	        	   }
	        	   var _max=header.find('.max');
	        	   isMax?_max.addClass('maxed'):_max.removeClass('maxed');
	        	   typeof option.onMax=='function' && option.onMax();
	            }
	          
	         function toCenter(w,h){
	        	 w=w||1;
	        	 h=h||1;
	        	 dialog.css({top:0.75*(wh-h)/2,left:(ww-w)/2,width:w,height:h+th});
	      	     bd.height(h);
	          }
	         
	         if(option.rel){
	             bd.empty().load(option.rel,function(){
	            	 setTimeout(function(){ autoBounds(bd.width(),bd.height());},10);
	            	 setTimeout(function(){option.onLoad();},100);
	            	});
	         }else if(option.iframe){
		        var ifr="<iframe class='jw-dialog-ifr iframe' src='"+option.iframe+"' style='width:100%;height:100%;border:0' frameborder=0 "+(option.iframeScroll?"":"scrolling=no")+" ></iframe>";
		         	ifr=bd.append(ifr).find('.iframe');
		         	var isLoaded=false,loading=null;
		         	setTimeout(function(){
		         		if(isLoaded)return;
		         		loading="<div class='jw-dialog-loading' style='position: relative;width:100%;height:"+option.height+"px;margin-top:-"+option.height+"px;'><div style='margin-top:"+option.height/2+"px'>&nbsp;</div></div>";
		         		loading=bd.append(loading).find('.jw-dialog-loading');
		         	},100);
		         	ifr.load(function(){
		         		isLoaded=true;
		         		if(loading){loading.remove();loading=null;}
		         		 var c=null,cl=0;
		         		 try{ c=$(this).contents(); cl=$('body',c).html().length;}catch(e){}
		               if(c){
			               if(cl>0){
			            	    var h=0,w=0;
				               c.find('.close').click(close).end().find('.max').click(max);
				               $('body',c).bind('close',close);
				               if(option.iframeFetchTitle){
					               var it=c.attr('title');
					               if(it.length)setTitle(it);
					              }
				               setTimeout(function(){
				            	    dialog.width(300);
					               bd.height(100);
				            	    setSize(c.width(),c.height());},5);//use timeout to fix ie
			               }else{
			                	 setSize(option.width,option.height);
			                 }
		               }else{
		            	   autoBounds();
		               }
		               option.onLoad();
		         	});
	         }else{
	        	 option.onLoad();
	         }
	         
	         //没有遮罩层时，可能会有有多个dialog
	        if(!option.over){
	        	dialog.click(function(){
	        		var _max=option.zIndex;
	        		$('.jw-dialog',win.document).not(dialog).each(function(){
	        			_max=Math.max(_max,parseInt($(this).css('z-index'))+1);
	        		});
	        		dialog.css('z-index',_max);
	        	});
	          }
	        
	        var fn=function(){autoBounds();dialog.is(":visiable")&&that.over();};
	        $(win).resize(fn);
	        option.fixed && setTimeout(function(){that.position_fixed(dialog,win);},1000);
	        dialog.bind('close',close).find('.close').click(close).mousedown(close).end().find('.max').click(max).mousedown(max);
	        if(option.close!==false){
	        	$(win).keydown(function(e){
	        		e.keyCode==27 && close();
	        	});
	        }
	        option.drag && this.drag(header,dialog,win);
	        return {close:close,setSize:setSize,setBounds:setBounds,setLocation:setLocation,setTitle:setTitle};
	    },
	    
	   //网页底部的提示信息 
	  msg:function(message,time,callFn){
			function createUI(){
					var tmp="<div class='jw-msg'><div class='jw-msg-bd'>"+message+"</div></div>";
					var div=$(tmp);
					div.appendTo('body').css('opacity',0.1).animate({opacity:0.8});
					jw.position_fixed(div);
					if($.isFunction(time)){
						callFn=time;
						time=0;
					}
					time=time||3000;
					if($.isFunction(callFn)){
						div.bind('jw-msg-call',callFn);
					}
					if(time>0){
						setTimeout(function(){
							div.animate({opacity:0},2000,function(){
								$(this).remove();
							}).trigger('jw-msg-call');
						},time);
					}
			}
			if($('.jw-msg').size()){
				$('.jw-msg').animate({width:0,height:0,left:$(window).width()/2},
						function(){
					$(this).trigger('jw-msg-call').remove();
					createUI();
			  });
			}else{
				createUI();
			}
		}
   };	
})(jQuery);

;(function($){	
    
    /**
     * jw.alert
     * 弹出提示，有一个图标和提示文字
     * @param text 提示文字
     * @param ico  提示图标坐标（如 1x1,5x2)  采用了jw-icons.gif中的图片 每个图片大小为50px
     * @param title 提示标题
     * @fn 点击确定时的回调函数 
     */
    var jwalert=function(text,ico,title,ext){
    	ico=((ico||1)+"").split("x");
    	ext=ext||{};
    	var x=ico[0],y=ico.length==2?ico[1]:1;
    	var id="jwalert"+new Date().getTime();
    	var style="background-position:-"+(x-1)*50+"px -"+(y-1)*50+"px;";
    	var code="<div class='jw-alert'>" +
	    			"<div class='icon' style='"+style+"'></div><div class='bd'>"+(text||'')+"</div><div style='clear:both'></div>" +
	    			"<div class='ft'>" +
	    			"<input type='button' value='&nbsp;确 定&nbsp;' id='"+id+"_ok' />";
			if(!!ext.cannel){
				code+="&nbsp;&nbsp;<input type='button' value='&nbsp;取 消&nbsp;' id='"+id+"_cannel' />";
			}
	    	code+="</div></div>";
    	var div=$(code);
    	var ja=null;
//    	div.appendTo(document.body);
    	var call_bk=function(fn){
    		if(ext){
    			var rt=(typeof fn=='function'?fn:(typeof ext=='function'?ext:function(){}))();
    			if(rt===false)return;
    		} 
    		ja.close();
    	};
    	$('#'+id+"_ok",div).click(function(){call_bk(ext.okFn);});
    	$('#'+id+"_cannel",div).click(function(){call_bk(ext.cannel);});
    	ja=jw.dialog({id:div,max:false,title:title||'提示',fixed:false,width:350});
    	if(ext.time)setTimeout(function(){ja.close()},ext.time);
      };
    $.extend(jw,{alert:jwalert}); 
})(jQuery);
