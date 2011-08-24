window.jw={};

/**
 * @author duwei<duv123@gmail.com>
 * 2010-12-06
 * jw drag
 * @see drag.html
 */
(function($){
  var  drag=function(bar,target){
     var b=$(bar),t=target?$(target):b,x,y,moving=false,opacity,zi;
      
	  t.css('position','absolute');
	  opacity=t.css('opacity')||1.0;
	  zi=t.css('z-index');
	  var ifr=t.find('iframe'),over=null;
	  var lastTime=0,timer=null;
	  //使用timeout 来 防止 dblclick 触发 mousedown 
      b.mousedown(function(e){
           	  var cTime=new Date().getTime();
           	  console.log(cTime-lastTime);
           	  if(cTime-lastTime<300){
           		  clearTimeout(timer);         		  
           		  return false;
             	  }
           	  lastTime=cTime;
           	  timer=setTimeout(function(){
	                x= e.clientX;
	                y= e.clientY;
	                moving=true;
					  b.css('cursor', 'move');
	                t.css({'opacity':opacity*0.7,'z-index':90000});
	                if(ifr){
	                	//通过使用timeout修正当窗体大小发生变化时，iframe的高度需要时变化后的高度以保证当前鼠标不进入iframe中
	                	setTimeout(function(){
		          		  var h=ifr.height();
		          		  over=$("<div style='position: relative;width:100%;height:"+h+"px;margin-top:-"+h+"px;'></div>");
		          		  ifr.after(over);
	                	},1);
		          	  };
	                $(window).mousemove(function(e1){
	                     if(moving){
	                       var offset=t.offset();
	                        t.css({top:offset.top+(e1.clientY-y),left:offset.left+(e1.clientX-x)});
	                        x=e1.clientX;
	                        y=e1.clientY;
	                        }
	                     return false;
	                }).mouseup(stop);
	            return false;    
	           	 },300);
      }).mouseup(stop);
      function stop(e){
         moving=false;
		  b.css('cursor', 'default');
         t.css({'opacity':opacity,'z-index':zi});
         over && over.remove();
         return false;
      }
    }
    $.extend(jw,{drag:drag});
})(jQuery);


(function($){
	function over(opt){
		opt=opt||'show';
		var over,wh=$(window).height(),bh=$('body').outerHeight();
		if(opt=='show'){
			if($('.jw-over').length)return;
			over=$('<div class="jw-over" ><style>.jw-over-hidden{overflow: hidden;height:'+wh+'px}</style></div>');
			$().ready(function(){
				$(document.body).append(over).addClass('jw-over-hidden');
				(typeof $.fn.bgiframe=='function') && over.bgiframe();
				over.height(bh+wh);
			});
		}else{
			$(document.body).removeClass('jw-over-hidden');
			setTimeout(function(){$('.jw-over').remove();},1);
		}
	}
	 $.extend(jw,{over:over});
})(jQuery);

;(function($){	
/**
    *弹出框
    *  .jw-dialog-title  可以不添加
    * 在dialog 容器内的元素 具有 .close 属性 则click时 可以关闭该dialog
    *@param id                需要以dialog 形式显示的层的 ID
    *@param operate           操作。打开时不需要填写，"close"  关闭指定的dialog
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
    function dialog(id,operate,option){
        var dia=null,option=option||{},operate=operate||"open",_id="jw-dialog-"+new Date().getTime(),header;
        if("close"==operate){
        	$('.jw-dialog').trigger('close');
        	return true;
        }
       
        var dialog=$("<table id='"+_id+"' class='jw-dialog'>" +
        		"<tr><td><div class='jw-dialog-top-left'></div></td><td><div class='jw-dialog-top'></div></td><td><div class='jw-dialog-top-right'></div></td></tr>" +
        		"<tr><td rowspan='2'><div class='jw-dialog-left'></div></td><td id='"+_id+"_hd' valign='top' class='jw-dialog-header'></td><td rowspan='2'><div class='jw-dialog-right'></div></td></tr>" +
        		"<tr><td valign='top' id='"+_id+"_bd'></td></tr>" +
        		"<tr><td><div class='jw-dialog-bottom-left'></div></td><td><div class='jw-dialog-bottom'></div></td><td><div class='jw-dialog-bottom-right'></div></td></tr>" +
        		"</table>");
        dialog.prependTo(document.body).hide();
        var body=$('#'+_id+"_bd",dialog);
        var hd=$('#'+_id+"_hd",dialog);
       
        dialog.css({left:($(window).width()-380)/2});
        if(id){
            body.append($(id));
        }
        if(option.over!=false){jw.over();}

        if(option.title!==false){
        	   var _div="<div style='float:right'><a href='javascript:;'  style='text-decoration:none;outline:medium none;'";
              header="<div class='jw-dialog-title'>"+
                         "<div style='float:left;width:auto' class='jw-title'>"+(option.title||'')+"</div>";
             option.close!=false && (header+=_div+" class='close'>X&nbsp;</a></div>");
             option.max!=false && (header+=_div+" class='max'>max</a>&nbsp;&nbsp;</div>");
             header+="<div style='clear:both'></div></div>";
              header=$(header);
              hd.append(header);
         }
        
        function setTitle(title){
        	 if(option.title!==false)header.find('.jw-title').text(title);
         }
        var setSize=function(width,height){
        	width  && dialog.animate({width:width});
        	if(!height)return;
    		if(option.iframe){
    			setTimeout(function(){
    				body.find('.jw-dialog-ifr').animate({height:Math.max(height,140)},setPosition);
    			},10);
    		}else{
    			body.animate({height:Math.max(height,140)});
    		}
        }
        if(option.height){
               var h=option.height;
               if((h+"").indexOf("%")>0)h=($(window).height()*parseFloat(h)/100.0);
               setSize(null,h);
         } 
         function setPosition(){
        	 setTimeout(function(){
	        	 var top=((Math.max($(window).height()-dialog.height(),0))/2+$(window).scrollTop())*0.75,
	        	     left=($(window).width()-dialog.width())/2+$(window).scrollLeft();
	                dialog.css({left:left}).animate({opacity:"show",top:top});
        	 },11);
           };
           
          var isMax=false,last={},lastHeight=0,lastMaxClickTime=0;
          var close=function(){
          	     jw.over('close');
               dialog.remove();
               typeof option.closeFn=='function'&& option.closeFn();
           },max=function(e){
        	   if(e)e.stopPropagation();
        	   var cTime=new Date().getTime();
        	   if(cTime-lastMaxClickTime<100){
        				  return false;
        		  }
        	   lastMaxClickTime=cTime;
        	   if(isMax){
        		   dialog.animate(last);
        		   setSize(null,lastHeight);
        		   isMax=false;
        	   }else{
        		   isMax=true;
	        	   last={top:dialog.css('top'),left:dialog.css('left'),width:dialog.width()};
	        	   lastHeight=body.height();
	        	   dialog.animate({top:$(window).scrollTop()+1,left:1,width:$(window).width()});
	        	   setSize(0,$(window).height()-55);
        	   }
        	   typeof option.maxFn=='function' && option.maxFn();
            };
         
         if(option.title!=false && !option.max)header.dblclick(max);
           
         if(option.rel){
             body.empty();
            if(option.iframe){
            	var ifr=$("<iframe class='jw-dialog-ifr iframe' src='"+option.rel+"' style='width:100%;height:100%;border:0' frameborder=0></iframe>");
            	ifr.appendTo(body);
            	dialog.show();
            	 ifr.load(function(){
            		 var c=null,newHeight=0,newWidth=0;
            		  try{
                          c=$(this).contents();
                          if(!c)return;
                          var ifrTitle=c.attr('title');
                          if(ifrTitle.length)setTitle(ifrTitle);
                        	  
                          newHeight=$('body',c).height();
                          newWidth=$('html',c).attr('scrollWidth')+10;
                          var wh=$(window).height(),
                              ww=$(window).width(),
                              b1=b2=false;
                          
                          if(newHeight>wh){newHeight=wh-52;b1=true;};
                          if(newWidth>ww){newWidth=ww-10;b2=true};
                          setSize(newWidth+15,newHeight+30);
                          (b1 && b2)? ifr.attr('scrolling','no'):ifr.removeAttr('scrolling');
                         }catch(e){}
                         
                         c.find('.close').click(close).end().find('.max').click(max);
                         setPosition();
            		});
                
            }else{
                body.load(option.rel,setPosition);
            }
         }else{
        	 setPosition();
         }
         
        var fn=function(){setPosition();jw.over();};
        $(window).resize(fn);
        option.fixed && $(window).scroll(setPosition);
        dialog.bind('close',close).find('.close').click(close).mousedown(close).end().find('.max').click(max).mousedown(max);
        if(option.close!=false){
        	$(window).keydown(function(e){
        		e.keyCode==27 && close();
        	});
        }
        !!!option.drag && jw.drag(header,dialog);
        return dialog;
    }
    window.jw=window.jw||{};
    $.extend(jw,{dialog:dialog}); 
    
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
	    			"<table style='width:100%'>" +
	    			"<tr><td width='60'><div class='jw-icon' style='"+style+"'></div></td><td>"+(text||'')+"</td></tr>" +
	    			"</table><center>" +
	    			"<input type='button' value='&nbsp;确 定&nbsp;' id='"+id+"_ok' />";
			if(!!ext.cannel){
				code+="&nbsp;&nbsp;<input type='button' value='&nbsp;取 消&nbsp;' id='"+id+"_cannel' />";
			}
	    	code+="</center></div>";
    	var div=$(code);
    	div.appendTo(document.body);
    	var call_bk=function(fn){
    		if(ext){
    			var rt=(typeof fn=='function'?fn:(typeof ext=='function'?ext:function(){}))();
    			if(rt===false)return;
    		} 
    		dialog(div,'close');
    	}
    	$('#'+id+"_ok").click(function(){call_bk(ext.okFn)});
    	$('#'+id+"_cannel").click(function(){call_bk(ext.cannel)});
    	dialog(div,"open",{max:false,title:title||'提示',fixed:false});
      };
    $.extend(jw,{alert:jwalert}); 
})(jQuery);

;(function($){
	var tip=function(id,opt){
	  opt=opt||{};
		var t=$(id);
		var rel=t.attr('href');
		
		var tipDiv=null,ifr=null;
		var ww=$(window).width(), hh=$(window).height();
		var w=opt.width||300,h=opt.height||200,x=y=0;
		var tipid="jw-tip-div"+parseInt(Math.random()*100000);
		
		var isFirst=true;
		function getTipDiv(){
		    tipDiv=$("#"+tipid);
    		if(!tipDiv.length){
     			tipDiv=$("<div style='position:absolute;border:1px solid' id='"+tipid+"'></div>");
     			ifr=$("<iframe src='"+rel+"' style='width:100%;height:100%;border:0'></iframe>");
     			ifr.appendTo(tipDiv);
    			$('body').append(tipDiv);
    		}else{
		          isFirst=false;
    		}
    		tipDiv.show();
		}
		var isOver=false;
		
		function getX(w){
		  var _x=x+w>ww?x-w-25:x;
		  return _x<0?5:_x;
		}
		function getY(h){
			var _y= y+h>hh?y-h-45:y;
			return _y<0?5:_y;
		}
		t.mouseover(function(e){
		  if(isOver)return;
		  getTipDiv();
		  if(isFirst){
			  var offset = t.offset();
				x=offset.left+30,y=offset.top+30;	
				tipDiv.css({top:y});
	  			ifr.load(function(){
				   try{
	      				var c=$(this).contents();
	      				 w=$('html',c).attr('scrollWidth')+20;
	      				 h=$('html',c).height();
	          		     x=getX(w);
	          		     y=getY(h);
	      				 tipDiv.width(w).height(h);
	      				 tipDiv.css('left',x).css('top',y);
	    			}catch(e1){
	        		     x=getX(w);
	    				 tipDiv.width(w).height(h);
	    				 tipDiv.css('left',x);
	    			}
	  			});
			  }
			isOver=true;
		}).mouseout(function(){
			 tipDiv && tipDiv.hide();
			 isOver=false;
		});
		
	}
	 window.jw=window.jw||{};
	 $.extend(jw,{tip:tip}); 
})(jQuery);

;(function(){
	//使ie6 支持 position fixed
	function position_fixed(target){
		target=$(target);
		var ie6=!!window.ActiveXObject && !window.XMLHttpRequest; 
		if(!ie6)return true;
		target.css({position:'absolute'});
		var bottom=parseInt(target.css('bottom'));
		var top=parseInt(target.css('top'));
		function listen(){
			if(bottom){
    			target.css('top',($(window).height()+$(window).scrollTop()-bottom-40)).show();
			}else{
    			target.css('top',($(window).scrollTop()+top)).show();
			}
		}
		$(window).scroll(listen).resize(listen);
		listen();
	}
	$.extend(jw,{position_fixed:position_fixed}); 
})(jQuery);

;(function(){
	function msg(message,time,callFn){
		var tmp="<div class='jw-msg'><div class='jw-msg-bd'>"+message+"</div></div>";
		var div=$(tmp);
		div.appendTo('body').css('opacity',0.1).animate({opacity:0.8});
		jw.position_fixed(div);
		if($.isFunction(time)){
			callFn=time;
			time=0;
		}
		time=time||3000;
		if(time>0){
			setTimeout(function(){
				div.animate({opacity:0},2000,function(){
					$(this).remove();
				});
				if($.isFunction(callFn)){
					callFn();
				}
			},time);
		}
	}
	 $.extend(jw,{msg:msg}); 
})(jQuery);