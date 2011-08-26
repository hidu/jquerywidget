window.jw=window.jw||{};

$.extend( window.jw, {
	version: "1.0",
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
		 a=null;
		 return result;
    }
});

/**
 * @author duwei<duv123@gmail.com>
 * 2010-12-06
 * jw drag
 * @see drag.html
 */
(function($){
  var  drag=function(bar,target){
     var b=$(bar),t=target?$(target):b,x,y,moving=false,opacity,zi;
      var _p=t.css('position');
      if(_p!='absolute' && _p!='fixed'){
    	  t.css('position','absolute');
      }
      _p=null;
	  var ifr=t.find('iframe'),over=null;
      b.mousedown(function(e){
    	  zi=zi||t.css('z-index');
    	  opacity=opacity||t.css('opacity')||1.0;
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
            $(document.body).mousemove(function(e1){
                 if(moving){
                   var offset=t.offset();
                    t.css({top:offset.top+(e1.clientY-y),left:offset.left+(e1.clientX-x)});
                    x=e1.clientX;
                    y=e1.clientY;
                    }
                 return false;
            }).mouseup(stop);
        return false;    
      }).mouseup(stop);
      function stop(e){
         moving=false;
		  b.css('cursor', 'default');
         t.css({'opacity':opacity,'z-index':zi});
         over && over.remove();
         return false;
      }
    };
    $.extend(jw,{drag:drag});
})(jQuery);


(function($){
	function over(opt){
		opt=opt||'show';
		var over,wh=$(window).height(),bh=$('body').outerHeight();
		if(opt=='show'){
			if($('.jw-over').length)return;
			over=$('<div class="jw-over" ></div>');
//			over.html('<style>.jw-over-hidden{width:100%;overflow: hidden;height:'+wh+'px}</style>');
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
    function dialog(option){
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
        var body=$('#'+_id+"_bd",dialog);
        var hd=$('#'+_id+"_hd",dialog);
        var ww=$(window).width(),wh=$(window).height();
        var isMax=false;
       
        dialog.css({left:(ww-option.width)/2,top:0.75*wh/2+$(window).scrollTop(),width:380,height:140});
        option.id && body.append($(option.id));
        option.over && jw.over();

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
        	  height=Math.min(height,wh-60);
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
          	     jw.over('close');
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
	        	   setBounds(1,$(window).scrollTop(),ww,wh-(dialog.height()-body.height()));
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
	         	ifr=$("<iframe class='jw-dialog-ifr iframe' src='"+option.iframe+"' style='width:100%;height:100%;border:0' frameborder=0></iframe>");
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
               c.find('.close').click(close).end().find('.max').click(max);

               var it=c.attr('title');
               if(it.length)setTitle(it);
               dialog.width(300);
               body.height(100);
               h=c.height()+10;
               w=c.width()+20;
               var b=0;
               if(h>wh){h=wh-52;b++;};
               if(w>ww){w=ww-10;b++;};
               dialog.css({left:ww/2,top:wh/2,width:"1px"});
               setSize(w,h);
               (b>1)? ifr.attr('scrolling','no'):ifr.removeAttr('scrolling');
               return true;
         	});
          }
        var fn=function(){autoBounds();dialog.is(":visiable")&&jw.over();};
        $(window).resize(fn);
        option.fixed && $(window).scroll(autoBounds);
        dialog.bind('close',close).find('.close').click(close).mousedown(close).end().find('.max').click(max).mousedown(max);
        if(option.close!=false){
        	$(window).keydown(function(e){
        		e.keyCode==27 && close();
        	});
        }
        option.drag && jw.drag(header,dialog);
        return {close:close};
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
    	var ja=null;
    	div.appendTo(document.body);
    	var call_bk=function(fn){
    		if(ext){
    			var rt=(typeof fn=='function'?fn:(typeof ext=='function'?ext:function(){}))();
    			if(rt===false)return;
    		} 
    		ja.close();
    	};
    	$('#'+id+"_ok").click(function(){call_bk(ext.okFn);});
    	$('#'+id+"_cannel").click(function(){call_bk(ext.cannel);});
    	ja=dialog({id:div,max:false,title:title||'提示',fixed:false});
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
		
	};
	 window.jw=window.jw||{};
	 $.extend(jw,{tip:tip}); 
})(jQuery);

;(function(){
	//使ie6 支持 position fixed
	function position_fixed(target){
		target=$(target);
		var ie6=$.browser.msie && $.browser.version<=6; 
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
	 $.extend(jw,{msg:msg}); 
})(jQuery);