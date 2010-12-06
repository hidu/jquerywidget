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
	 
	  
      b.mousedown(function(e){
                x= e.clientX;
                y= e.clientY;
                
                moving=true;
				  b.css('cursor', 'move');
                t.css({'opacity':opacity*0.7,'z-index':90000});
                if(ifr){
	          		  var h=t.height()-b.outerHeight();
	          		  over=$("<div style='position: relative;width:100%;height:"+h+"px;margin-top:-"+h+"px;'></div>");
	          		  ifr.after(over);
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
      }).mouseup(stop);
      function stop(e){
         moving=false;
		  b.css('cursor', 'default');
         t.css({'opacity':opacity,'z-index':zi});
         over && over.remove();
         return false;
      }
    }
    window.jw=window.jw||{};
    $.extend(jw,{drag:drag});
})(jQuery);


(function($){
/**
    *弹出框
    *   需要添加指定的样式  .jw_dialog_over  .jw_dialog 
    *  .jw_dialog_title  可以不添加
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
    *@param option.minWidth      宽度 px
    *@param option.minHeight     高度 px
    *@param option.scroll     是否允许dialog 随着页面滚动(一直居中)
    *@param option.noOver     若为true,不显示笼罩背景
    *@param option.drag       是否允许拖动，默认允许
    *@param option.maxFn      最大化事件
    *@param option.closeFn    关闭事件
    */
    function dialog(id,operate,option){
        var dia=null;
        
        if(id){
            dia=$(id);
        }else{
            dia=$("<div></div>");  
            dia.appendTo(document.body);
         }
        if("close"==operate){
          dia.trigger('close');
          return true;
        }
        var hasOver=!(option.noOver===true);
        if(hasOver){
	         var over=$('<div class="jw_dialog_over" ></div>');
	         $(document.body).append(over);
	         (typeof $.fn.bgiframe=='function') && over.bgiframe();
	         setOver();
        }
        
        function setOver(){
        	if(!hasOver)return;
        	var bh=$('body').height(),wh=$(window).height();
	       over.height(bh>wh?bh:wh);
         }
         var dialog=dia.parent('div.jw_dialog');
         dia.addClass('jw_dialog_body');
         if(!dialog.size()){
             dia.wrap("<div class='jw_dialog'></div>");
             if(option.title!==false){
            	   var _div="<div style='float:right'><a href='javascript:;'  style='text-decoration:none;outline:medium none;'";
	             var header="<div class='jw_dialog_title'>"+
	                         "<div style='float:left;width:auto' class='jw_title'>"+(option.title||'')+"</div>";
	             option.close!=false && (header+=_div+" class='close'>X&nbsp;</a></div>");
	             option.max!=false && (header+=_div+" class='max'>max</a>&nbsp;&nbsp;</div>");
	             header+="<div style='clear:both'></div></div>";
	             header=$(header);
	             dia.before(header);
             }
             dialog=dia.parent('div.jw_dialog');
             dia.show();
            
         }
         
         
        function setTitle(title){
        	 if(option.title!==false)header.find('.jw_title').text(title);
         }
         
         option.width && dialog.width(option.width);
         var diaHeight=0;
         if(option.height){
               var h=option.height;
               if(h.indexOf("%")>0)h=($(window).height()*parseFloat(h)/100.0);
               dia.height(h);
         } 
        
//         dialog.show();
         var setPosition=function(){
        	 if(option.minHeight||'')dia.height()>option.minHeight?"":dia.height(option.minHeight);
        	 if(option.minWidth||'')dialog.width()>option.minWidth?"":dialog.width(option.minWidth);
        	 var diaHeight=dialog.outerHeight(),
        	 diaWidth=dialog.outerWidth();
        	 var _t=$(window).height()-diaHeight;
        	 var top=((_t>0?_t:0))/2+$(window).scrollTop(),
        	     left=($(window).width()-diaWidth)/2+$(window).scrollLeft();
                dialog.css({top:top,left:left}).show();
           };
          var isMax=false,last={},lastHeight=0;
          var close=function(){
          	     hasOver && over.remove();
               id?dialog.hide():dialog.remove();
               typeof option.closeFn=='function'&& ption.closeFn();
           },max=function(){
        	   if(isMax){
        		   dialog.css(last);
        		   dia.height(lastHeight);
        		   isMax=false;
        	   }else{
	        	   last={top:dialog.css('top'),left:dialog.css('left'),width:dialog.width()};
	        	   lastHeight=dia.height();
	        	   dialog.css({top:$(window).scrollTop(),left:1}).width($(window).width()-5);
	        	   dia.height($(window).height()-header.outerHeight()-5);
	        	   isMax=true;
        	   }
        	   typeof option.maxFn=='function' && option.maxFn();
            };
            
         if(option.title!=false)header.dblclick(max);
           
         if(option.rel){
             dia.empty();
            if(option.iframe){
            	var ifr=$("<iframe src='"+option.rel+"' style='width:100%;height:100%;border:0' frameborder=0></iframe>");
            	ifr.appendTo(dia);
            	
            	 ifr.load(function(){
            		console.log(ifr);return;
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
                          (b1 && b2)? ifr.attr('scrolling','no'):ifr.removeAttr('scrolling');
                         }catch(e){}
                         
                         dia.height(newHeight+30);
                         dialog.width(newWidth+15);
                         c.find('.close').click(close).end().find('.max').click(max);
                         setPosition();
            		});
                setPosition();
            }else{
                dia.load(option.rel,setPosition);
            }
         }else{
        	 setPosition();
         }
         
        var fn=function(){setPosition();setOver();};
        $(window).resize(fn).scroll(fn);
        option.scroll && $(window).scroll(setPosition);
        dia.add(dialog).bind('close',close).find('.close').click(close).mousedown(close).end().find('.max').click(max).mousedown(max);
        if(option.close!=false){
        	$(window).keydown(function(e){
        		e.keyCode==27 && close();
        	});
        }
        (option.drag && false) !=false && jw.drag(header,dialog);
        return dia;
    }
    window.jw=window.jw||{};
    $.extend(jw,{dialog:dialog}); 
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