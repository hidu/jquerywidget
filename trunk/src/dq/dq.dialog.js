/**
    *弹出框
    *   需要添加指定的样式  .dq_dialog_over  .dq_dialog 
    *  .dq_dialog_title  可以不添加
    * 在dialog 容器内的元素 具有 .close 属性 则click时 可以关闭该dialog
    *@param id                需要以dialog 形式显示的层的 ID
    *@param operate           操作。打开时不需要填写，"close"  关闭指定的dialog
    *@param option.title      标题。当设置为false 时，不显示标题
    *@param option.close      是否显示close 按钮
    *@param option.bgiframe   是否使用bgiframe 插件(修正ie6 select z-index 问题)
    *@param option.rel        ajax 页面的地址 或者为一个其他页面地址
    *@param option.iframe     对上述rel 属性使用iframe 页面加载
    *@param option.width      宽度(可以用%)
    *@param option.height     高度(不使用%）
    *@param option.scroll     是否允许dialog 随着页面滚动(一直居中)
    *@param option.noOver     若为true,不显示笼罩背景
    *@param option.closeFn    关闭事件
    */
    dialog:function(id,operate,option){
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
	         var over=$('<div class="dq_dialog_over" ></div>');
	         $(document.body).append(over);
	         
	         option.bgiframe!==false && (typeof $.fn.bgiframe=='function') && over.bgiframe();
	         
	         var bh=$('body').height(),wh=$(window).height();
	         over.height((bh>wh?bh:wh)+30);
        }
         var dialog=dia.parent('div.dq_dialog');
         if(!dialog.size()){
             dia.wrap("<div class='dq_dialog'></div>");
             if(option.title!==false){
	             var header="<div class='dq_dialog_title'>"+
	                         "<div style='float:left' class='dq_title'>"+(option.title||'')+"</div>"+
	                         "<div style='float:right'>"+((option.close!=false)?"<a href='javascript:;' class='close' style='text-decoration:none'>X</a>":'')+"</div>"+
	                         "<div style='clear:both'></div>"+
	                         "</div>";
	             dia.before(header);
             }
             dialog=dia.parent('div.dq_dialog');
             dia.show();
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
        	 var diaHeight=dialog.outerHeight(),
        	 diaWidth=dialog.outerWidth();
        	 var top=($(window).height()-diaHeight)/2+$(window).scrollTop(),
        	     left=($(window).width()-diaWidth)/2+$(window).scrollLeft();
//                dialog.animate({'top':top+'px','left':left+'px'},300);
                dialog.css({top:top,left:left}).show();
           };
         
          var close=function(){
          	   hasOver && over.remove();
               id?dialog.hide():dialog.remove();
               typeof option.closeFn=='function'&& option.closeFn(this);
          };
           
         if(option.rel){
             dia.empty();
            if(option.iframe){
            	var ifr=$("<iframe src='"+option.rel+"' style='width:100%;height:100%;border:0'></iframe>");
            	ifr.appendTo(dia);
            	 ifr.load(function(){
            		 var c=null,newHeight=0,newWidth=0;
            		  try{
                          c=$(this).contents();
                          newHeight=$('body',c).height();
                          newWidth=$('body',c).width();
                          var b1=$(window).height()>newHeight,
                              b2= $(window).width()>newWidth;
                          b1 && dia.height(newHeight+5);
                          b2 && dialog.width(newWidth+5);
                          (b1 && b2)? ifr.attr('scrolling','no'):ifr.removeAttr('scrolling');
                         }catch(e){}
                         c.find('.close').click(close);
                         setPosition();
            		});
                setPosition();
            }else{
                dia.load(option.rel,function(){
                    setPosition();
                    dia.find('.close').click(close);
                });
            }
         }else{
        	 setPosition();
         }
         
       
        $(window).resize(setPosition);
        option.scroll && $(window).scroll(setPosition);
        dia.bind('close',close);
        dialog.find(".close").bind('click',close);
        if(option.close!=false){
        	$(window).keydown(function(e){
        		e.keyCode==27 && close();
        	});
        }
        return dia;
    }