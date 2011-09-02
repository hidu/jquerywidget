/**
* jQuery工具包，其中部分需要其他插件支持，需要插件有$.form.js,$.validate.js
* $.form.js   http://malsup.com/$/form/
* $.validate.js  http://bassistance.de/$-plugins/$-plugin-validation/
* 主要是一些常用的ajax 相关的操作。
* 20100715  修正了loadPager 当没有target时分页不能使用的问题
* 20100803  修正ajaxsubmit dq header 过大的问题
* 20101208  dialog  添加了close 事件
* 20101231  ajax load 给内容添加close事件支持
*20110407  loadHref判断链接是否存在
*20110419    ajaxFile支持file标签 多文件选择
*20110826 ajaxSubmit 添加表单注册延时参数 delay
*20110829  移除dialog
*20110901  loadPager 聚焦到目标
* @copyright duwei
* @author duwei<duv123@gmail.com>
 */
;(function($){
  window.dq=window.dq||{};
  if(window.dq.version)return;
  
  window.dq={
		 version:'20110902',
      /**
       *版本号
       */
       toString:function(){
           return "DuWei Ajax util "+this.version;
       },
       /**
       *在ajax load 数据的时候，使用该方法将目标显示正在装载的动画效果
       * 需要在样式表中设置 .loadingImg 
       *@param target string ajax 装载目标
       */
       ajaxLoading:function(target){
         var t=$(target);
         var h=t.height();
         if(h<70){h=80;}else if(h>500){h=300;}
         var i=0,nbsp='&nbsp;&nbsp;&nbsp;&nbsp;';
         if(!this.ajaxLoading_nbsp){
             while(i<3){
               nbsp+=nbsp;
               i++;
             }
             this.ajaxLoading_nbsp=nbsp;
         }
          t.empty().html("<div class='dq_ajaxLoding' style='height:"+h+"px;padding-top:"+(h-70)/2+"px;'>正在加载...<br/><span class='dq_loadingImg'>"+this.ajaxLoading_nbsp+"</span></div>");
        },
    /**
     *@exmaple 1  使用Ajax进行表单查询  将查询内容显示在 dic#ret 中
       <form id="myform" action="search.php">
         关键词:<input type='text' name="q">
         <input type="submit" value="查询">
       </form>
       <div id="ret"></div>
      <script>
         dq.ajaxSubmit('#myform','#ret');
      </script>
     
     @example 2 使用ajax 提交表单【登陆】(json格式返回数据)
     <form id="loginform" action="save.php">
       姓名:<input type="text" name="name" class="required"><br>
       密码:<input type="password" name="passwd" class="required"><br>
       <input type="submit" value="登陆">
     </form>
     <script>
     //假设返回的数据为json格式  {status:1,info:'提示信息'} status=1 表示状态为登陆成功
      dq.ajaxSubmit("#loginform",'',function(d){
         if(d.status==1){
             location.href="index.html";
         }else{
           alert("登陆失败："+d.info);
         }
      },{dataType:'json',validate:true});
     </script>

     * submit 提交ajax 表单
     * @param formID    表单ID eg:'＃searchForm'
     * @param targetID  显示目标ID  eg: '#retDiv'
     * @param sucFn  成功后执行的函数
     * @param ext  其他参数
     *@param ext.validate boolean 是否使用$.validate 插件进行表单验证
     *@param ext.reload  boolean  当使用ajax 表单查询的时候，是否在现实位置添加[刷新列表]的 链接（ajax刷新当前页）
     *@param ext.delay  int  注册函数是否延时
     *@param ext.validateRule object $.Validate 的验证规则
     *@param ext.beforeFn function  发送请求前的自定义回调函数 返回 false 将终止动作
     */
    ajaxSubmit:function(formID,targetID,sucFn,ext){
        if($.isFunction(targetID)){
	        	ext=sucFn;
	        	sucFn=targetID;
	        	targetID=null;
	       }
        if(!$.isFunction(sucFn)){
        	ext=sucFn;
        	sucFn='';
           }
        
        ext=ext||{reload:false,delay:0};
         
        var that=this,
            form=$(formID),
            resetBt=form.find(':reset'),
            submitEnable=function(enable){
               form.find(':submit').attr('disabled',enable?false:true);
            };
         resetBt.click(function(){
             var title=$(this).attr('title');
              if(title.length && false===confirm(title)){
                  return false;
              }
              submitEnable(true);
              form.resetForm();
              //触发自定义的reset事件 这样我们可以为表单的一些组合控件自定义reset 事件
              form.find(":input").trigger('reset'); 
              return false;
          });//end :reset
         //2010-02-22  对表单中的text 类型的控件进行trim
         form.find(':text').bind('change',function(){
        	 $(this).val($.trim($(this).val()));
         });
        
        //before ajax submit function
        var showRequest=function(formData, jqForm, options) {
            if($.isFunction(ext.beforeFn)){
            	  if(ext.dataType === undefined)ext.dataType='json';
            	  if(false===ext.beforeFn(jqForm)){
                   return false;
            	  }
              }
            submitEnable(false);
            var qstring = $.param(formData);
            if(targetID){
                 that.ajaxLoading(targetID);
                 if(ext.reload){
		               $(targetID).attr('rel',options.url+'?'+qstring).unbind('reload').bind('reload',function(){
		                      that.ajaxLoading(targetID);
		                      $(this).load($(this).attr('rel'));
		                      return;
		                  });
                 }
            }
            
        };//end showRequest
        
        //自定义ajax 出错提示信息
        var errorFn=function(a,b,c){
            targetID && $(targetID).html('load failed '+a.responseText);       
            submitEnable(true);
        };
        
      
        var options={
                target:targetID,
                beforeSubmit:showRequest,
                timeout:ext.timeout||30000,
                dataType:ext.dataType||null,
                success:function(data){
                    $.isFunction(sucFn) && sucFn(data);
                    submitEnable(true);
                },
                beforeSend:function(xml){
  				  try{
  				    xml.setRequestHeader("dq",window.screen.height+"/"+window.screen.width);
  				   }catch(e){}
  				},
                error:errorFn
         };
         function _reg_form(){
	         if(ext.validate !== false && $.validator){ //使用 $.validator 进行表单验证
	             var validateOpt={submitHandler: function() {form.ajaxSubmit(options);}};
	             ext.validateOpt  && $.extend(validateOpt, ext.validateOpt);
	             ext.validateRule && $.extend(validateOpt,{rules:ext.validateRule});
	             if(ext.errorToTip){
	                   /**
	                 *jquery.validate 验证后错误信息显示位置设置函数，
	                    *在ajaxSubmit 中若该默认的不能满足需求可以用户自定义
	                    */
	                   var   validateErrorPlace=function(error, element){
	                         var nextTip=element.next('span.tip');
	                         var tip=element.parents("td").find('span.tip');
	                         var tipsize=tip.size();
	                         if(nextTip.size()){
	                             error.appendTo(nextTip);
	                         }else if(tipsize){
	                                  error.appendTo(tip.eq(tipsize-1));
	                          }else{
	                                 error.insertAfter(element);
	                          }
	                     };//end validateErrorPlace
	                 var fn= (ext.validateErrorPlace && $.isFunction(ext.validateErrorPlace))?ext.validateErrorPlace:validateErrorPlace;
	                 $.extend(validateOpt,{errorPlacement: fn});
	              }
	               form.validate(validateOpt);
	         }else{
	             form.submit(function(){
	                    $(this).ajaxSubmit(options);
	                    return false;
	                });
	         }
         }
         if(ext.delay){
	         $().ready(function(){
	        	setTimeout( _reg_form,ext.delay);
	         });
         }else{
        	 _reg_form();
         }
         return form;
    },
    
   

    /**
     * 阻止ajax表单返回的html页面中的链接直接跳转到其他页面，主要用于分页的链接，让链接地址在目标targetID内显示。
     * eg:jq.Pojaa.loadHref('.pager a','#retDiv')
     * 该函数需要和链接在同一个页面中声明.
     * @param hrefSelecter 链接选择器
     * @param targetID  显示目标ID
     */
    loadHref:function(selector,targetID,relAttrName){
         var that=this,target=$(targetID);
        $(selector).click(function(){
             var rel=$(this).attr(relAttrName||'href');
             if(!rel)return;
             that.centerIt(target);
             that.ajaxLoading(targetID);
             target.attr('rel',rel).load(rel).unbind('reload').bind('reload',function(e){
                  that.ajaxLoading(targetID);
                  $(this).load($(this).attr('rel'));
                  return false;
             });
           return false;
       });
    },
    
    /**
    *
    *
    <div id="ret">
        <div>你好这里是第1页显示的信息</div>
        <div class="pager">
            <a href="a.html?page=1">第1页</a>
            <a href="a.html?page=2">第2页</a>
            <a href="a.html?page=3">第3页</a>
            <a href="a.html?page=4">第4页</a>
            <select fn="page" onchange='location.href=page(this.value);'>
               <option value="1">1</option>
               <option value="2">2</option>
            </select>
        </div>
    </div>
    <script>
     dq.loadPager();
     function page(p){
        return 'a.html?page='+p;
     }
    </script>

    *@param pagerID string 分页链接所在的div层的选择器
    *@param targetID string  ajax 分页显示装载的目标
    */
    loadPager:function(pagerID,targetID){
        var  pager=$(pagerID||'.dq_pager'),
             target=$(targetID||'#ret'),
             that=this;
         if(!target.size())return false;
        pager.find("a").click(function(){
        	try{
        		that.centerIt(target);
              that.ajaxLoading(target);
              var rel=$(this).attr('href');
              target.attr('rel',rel).load(rel);
        	}catch(e){}
              return false;
       });

        //给容器 绑定自定义事件 reload
        !target.attr('rel') && target.attr('rel',$('li.current',pager).attr('rel'));
        target.unbind('reload').bind('reload',function(){
             that.ajaxLoading(target);
             $(this).load($(this).attr('rel'));
        });
               
    },
    /**
     * 将指定控件至于屏幕中间
     */
    centerIt:function(target){
    	var y=$(target).offset().top;
		var h=$(window).height();
		if(y>window.scrollY+0.75*h || y<window.scrollY){
			window.scrollTo(window.scrollX,y-20);
		}
    },

   /**
     * 全选组件
     example:
     
    1 <input type="checkbox" class="checkAll" name="aaa[]" value="1"/>
    2 <input type="checkbox" class="checkAll" name="aaa[]" value="2"/>
    3 <input type="checkbox" class="checkAll" name="aaa[]" value="3"/>
    4 <input type="checkbox" class="checkAll" name="aaa[]" value="4"/>
    
     <a onclick="dq.checkAll('.checkAll',1)" href="javascript:;">全选</a>
     <a onclick="dq.checkAll('.checkAll',0)" href="javascript:;">全不选</a> 
     <a onclick="dq.checkAll('.checkAll',2)" href="javascript:;">反选</a>   
     <a onclick="var ids=dq.checkAll('.checkAll',9);alert(ids.join(','))" href="javascript:;">当前选择项</a>   

     *@param targetClass  checkBox 的选择器，一般使用指定的class
     *@param  type  选择类型  0:全不选，1:全选, 2:反选, 9:返回所有选择的值
     */
    checkAll:function(targetClass,type){
    	if(typeof type=='object'){
    		if($(type).attr('checked')){
    			type=1;
    		}else{
    			type=0;
    		}
    	}
      if(0==type){ //全不选
        $(targetClass).attr('checked',false);
      }else if(1==type){//全选
        $(targetClass).attr('checked',true);
      }else if(2==type){//反选
        $(targetClass).each(function(){
          $(this).attr('checked',!($(this).attr('checked')));
        });
      }else if(9==type){//返回所有选择的值
        return $.map($(targetClass+':checked'),function(n){
           return $(n).val();
         });
      }
    },

    /**
     * 点击table 中的链接后给当前行添加背景色
     * 需要在样式表中添加样式  tr.select
     * table tr.select{background:#CFE7FF none repeat scroll 0 0}
     *@param table  String  选择器
     */
    trSelect:function(tableSelector){
        var table=$(tableSelector||'.dqTable'),
            fn=function(){
              table.find('tr').removeClass('dq_select');
              $(this).parents('tr').addClass('dq_select');
          };
        table.find('tbody td *').bind('click',fn);
        table.find('tbody td').bind('dblclick',fn);
    },
    
   /**
    *ajax 链接 
    * 需要$ 1.3 版本
       <a href="a.html" ajax="#ret">ajax测试</a>
        <div id="ret">将a.html 显示在这里</div>
    */
    ajaxLink:function(attr){
       attr=attr||'ajax';
       var that=this;
       $("a["+attr+"]").live('click',function(){
           var t=$($(this).attr(attr));
           that.ajaxLoading(t);
           t.data('url',this.href).load(this.href).unbind('reload').bind('reload',function(){
               that.ajaxLoading(t);
               t.load(t.data('url'));
               return false;
            });
          return false;
       });
    },
    

    /**
     * ajax 上传文件
     * 不支持一个表单多个file标签
     * 该功能需要 $.form.js
     *@param formID  上传的表单
     *@param beforeFn  上传前执行函数，返回false 中断上传操作
     *@param sucFn(data,form)  完成时执行函数
     *@param option Array  可选配置项
     *@param option.fileExt  允许上传的文件后缀,默认为['bmp','jpg','jpeg','png','gif']
     *@param option.dataType  上传成功后返回的数据类型，同ajax 的dataType
     *@param option.autoSubmit boolean 默认false，选择文件后是否自动提交表单
     */
    ajaxFile:function(formID,beforeFn,sucFn,option){
        option=option||{};
        option.fileExt=option.fileExt||['bmp','jpg','jpeg','png','gif'];
       
        var isAllow=function(f){
        	var i=f.lastIndexOf("."),
        	ext = i>=0?f.substring(i+1,f.length).toLowerCase():'';
        	var isOk=$.inArray(ext,option.fileExt)>-1;
        	if(!isOk) alert("文件:\n"+f+"\n不被支持！\n请选择后缀为"+option.fileExt.join()+"的文件");
        	return isOk;
         }
        var  form=$(formID),
           file=form.find(':file'),
           fobj=file[0],
           checkFileExt=function(){
        	       if(fobj.multiple){
        	    	   for(var j=0;j<fobj.files.length;j++){
        	    		   var _f=fobj.files[j].name;
        	    		   if(!isAllow(_f)){
           	        		file.val("");
           	        		return false;
           	        	    }
        	    	    }
        	        }else{
        	        	if(!isAllow(file.val())){
        	        		file.val("");
        	        		return false;
        	        	}
        	        }
                return true;
           };
         var st=true;//fix ie6 cannot reset file value
         file.change(function(){
                   if(file.val().length>0)st=checkFileExt();
         });
       form.ajaxForm({
           beforeSubmit:function(formData, jqForm, options){
                var  f=file.val();
                 if(f.length<1){
                  alert('请选择要上传的文件');
                  return false;
                  }
                 if(false===checkFileExt())return false;
                 if((typeof beforeFn=="function") && false===beforeFn(jqForm)){
                        return false;
                }
           },//endBeforeSubmit
          dataType:option.dataType||"json",
          success:function(data){
             if(typeof sucFn=="function"){
                 sucFn(data,form);
             }
            },
          error:function(xhr, textStatus, errorThrown){
            	alert("something wrong!\n\n"+xhr.responseText);
           }
     });//endAjaxForm
      if(option.autoSubmit){
          file.change(function(){st && file.val().length && form.submit();});
       }
     return form;
    },

    optionToSelect:function(value,text,select){
        jQuery('<option value="'+value+'">'+text+'</option>').appendTo(select);
   },
   /**
    * 级联控件
    */
    relation:function(m,n,allValue,ctxt){
  	  m=jQuery(m);
  	  var t=jQuery(n),that=this;
  	  m.change(function(){
  		  var v=jQuery(this).val(),
  		     _v=t.find('option:selected').val(),
  		     nextAll=allValue?(allValue[v]||''):'';
  		  t.empty();
  		  ctxt && that.optionToSelect('',ctxt,t);
  		  jQuery.each(nextAll,function(i,txt){
  			  that.optionToSelect(i,txt,t);
  			});
  		  if(_v && nextAll[_v]){
  			  t.val(_v);
  		  } 
  		  t.change();
  	  }).change();
    },
    
    findByName:function(name,doc){
    	return jQuery(document.getElementsByName(name),doc||"*").map(function(index, element) {
    		return element.name == name && element  || null;
    	});
    }
};
})(jQuery);