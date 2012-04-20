/**
* jQuery工具包，其中部分需要其他插件支持，需要插件有$.form.js,$.validate.js
* $.form.js   http://malsup.com/$/form/
* $.validate.js  http://bassistance.de/$-plugins/$-plugin-validation/
* 主要是一些常用的ajax 相关的操作。
* @copyright duwei
* @author duwei<duv123@gmail.com>
 */
;(function($){
  window.jf=window.jf||{};
  if(window.jf.version)return;
  
  window.jf={
		 version:'20120421',
      /**
       *版本号
       */
       toString:function(){
           return "form kit "+this.version;
       },
       /**
       *在ajax load 数据的时候，使用该方法将目标显示正在装载的动画效果
       *@param target string ajax 装载目标
       */
       loading:function(target){
         var t=$(target),h=t.height();
         if(h<70){h=80;}else if(h>500){h=300;}
          t.empty().html("<div class='jf_loading' style='height:"+h+"px;padding-top:"+(h-70)/2+"px;'>正在加载...<div>&nbsp;</div></div>");
        },
    /**
     *@exmaple 1  使用Ajax进行表单查询  将查询内容显示在 dic#ret 中
       <form id="myform" action="search.php">
         关键词:<input type='text' name="q">
         <input type="submit" value="查询">
       </form>
       <div id="ret"></div>
      <script>
         jf.form('#myform','#ret');
      </script>
     
     @example 2 使用ajax 提交表单【登陆】(json格式返回数据)
     <form id="loginform" action="save.php">
       姓名:<input type="text" name="name" class="required"><br>
       密码:<input type="password" name="passwd" class="required"><br>
       <input type="submit" value="登陆">
     </form>
     <script>
     //假设返回的数据为json格式  {status:1,info:'提示信息'} status=1 表示状态为登陆成功
      jf.form("#loginform",function(d){
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
     *@param ext.validate 是否使用$.validate 插件进行表单验证,设置为false不验证，为object时将其作为验证选项
     *@param ext.reload  boolean  当使用ajax 表单查询的时候，是否在现实位置添加[刷新列表]的 链接（ajax刷新当前页）
     *@param ext.delay  int  注册函数是否延时
     *@param ext.before function  发送请求前的自定义回调函数 返回 false 将终止动作
     */
    form:function(formID,targetID,sucFn,ext){
        if($.isFunction(targetID)){
	        	ext=sucFn;
	        	sucFn=targetID;
	        	targetID=null;
	       }
        if(!$.isFunction(sucFn)){
        	ext=sucFn;
        	sucFn='';
           }
        
        ext=$.extend({},{
        	             dataType:null,
        	             delay:0,
        	             validate:true,
        	             timeout:30000,
        	             validate:{},
        	             before:null
         },ext||{});
         
        var that=this,
            form=$(formID),
            submitEnable=function(enable){ form.find(':submit').attr('disabled',!enable);};
            
            form.find(':reset').click(function(){
              var title=$(this).attr('title');
              if(title.length && false===confirm(title))return false;
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
        	if(ext.before){
	        	  if(ext.dataType ==null)ext.dataType='json';
	        	  if(false===ext.before.call(jqForm))return false;
        	}
            submitEnable(false);
            targetID && that.loading(targetID);
            
        };//end showRequest
        
      
        var options={
                target:targetID,
                beforeSubmit:showRequest,
                timeout:ext.timeout,
                dataType:ext.dataType,
                success:function(data){
                	   submitEnable(true);
                    $.isFunction(sucFn) && sucFn.call(form,data);
                },
                beforeSend:function(xml){
  				  try{
  				    xml.setRequestHeader("jf",window.screen.height+"/"+window.screen.width);
  				   }catch(e){}
  				},
                error:function(a,b,c){
                    submitEnable(true);
                    targetID && $(targetID).html('load failed '+a.responseText);       
                }
         };
         function _reg_form(){
	         if(ext.validate !== false && $.validator){ //使用 $.validator 进行表单验证
	             var validateOpt={submitHandler: function() {form.ajaxSubmit(options);}};
	             $.extend(validateOpt, ext.validate);
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
     * eg:jf.loadHref('.pager a','#retDiv')
     * 该函数需要和链接在同一个页面中声明.
     * @param hrefSelecter 链接选择器
     * @param targetID  显示目标ID
     */
    ajaxLink:function(linkSelector,targetID){
         var that=this,target=$(targetID);
         if(!target.size())return false;
        $(linkSelector).die('click').live('click',function(){
             var rel=$(this).attr('href');
             if(!rel)return;
             that.centerIt(target);
             that.loading(targetID);
             target.attr('rel',rel).load(rel);
           return false;
       });
    },
    
    /**
    *
    *@param pagerID string 分页链接所在的div层的选择器
    *@param targetID string  ajax 分页显示装载的目标
    */
    pager:function(pagerID,targetID){
       this.ajaxLink($(pagerID||'.pager').find('a'),targetID);
    },
    /**
     * 将指定控件至于屏幕中间
     */
    centerIt:function(target){
    	var y=$(target).offset().top;
		var h=$(window).height();
		if(y>window.scrollY+0.75*h || y<window.scrollY) window.scrollTo(window.scrollX,y-20);
    },

   /**
     * 全选组件
     example:
     
    1 <input type="checkbox" class="checkAll" name="aaa[]" value="1"/>
    2 <input type="checkbox" class="checkAll" name="aaa[]" value="2"/>
    3 <input type="checkbox" class="checkAll" name="aaa[]" value="3"/>
    4 <input type="checkbox" class="checkAll" name="aaa[]" value="4"/>
    
     <a onclick="jf.checkAll('.checkAll',1)" href="javascript:;">全选</a>
     <a onclick="jf.checkAll('.checkAll',0)" href="javascript:;">全不选</a> 
     <a onclick="jf.checkAll('.checkAll',2)" href="javascript:;">反选</a>   
     <a onclick="var ids=jf.checkAll('.checkAll',9);alert(ids.join(','))" href="javascript:;">当前选择项</a>   

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
        var table=$(tableSelector||'table'),
            fn=function(){
              table.find('tr').removeClass('jf_select');
              $(this).parents('tr').addClass('jf_select');
          };
        table.find('tbody td *').bind('click',fn);
        table.find('tbody td').bind('dblclick',fn);
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
         };
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
                 if((typeof beforeFn=="function") && false===beforeFn.call(jqForm)){
                        return false;
                }
           },//endBeforeSubmit
          dataType:option.dataType||"json",
          success:function(data){
             if(typeof sucFn=="function"){
                 sucFn.call(form,data);
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
        $('<option value="'+value+'">'+text+'</option>').appendTo(select);
   },
   /**
    *    
    var values={1:{11:"a",12:'b'},2:{21:'c',22:'d'}};
    jf.relation("#first",'#second',values,"请选择");
    var values1={11:{111:"a1",112:'b1'},12:{121:'b1',122:'b2'},21:{211:'c1',212:'c2'},22:{221:'d1',222:'d2'}};
    jf.relation("#second",'#third',values1,"请选择");
    * 级联控件
    * @param first   第一个控件ID #first
    * @param second  第二个控件ID #second
    * @param values  第一个控件关联与 第二个控件的数据 若是url则使用此地址ajax请求数据
    * @param ctxt   默认替代文本 如 请选择
    */
    relation:function(first,second,values,ctxt){
  	  var t=$(second),that=this;
  	  $(first).change(function(){
  		  var v=$(this).val(),
  		     _v=t.find('option:selected').val(),
  		     nextAll='';
  		     if(values && (typeof values)=='string'){
  		    	 $.getJSON(values+v,function(data){
  		    		nextAll=data;
  		    		fill();
  		    	 });
  		     }else{
  		       nextAll=values?(values[v]||''):'';
  		       fill();
  		     }
  		 function fill(){
	  		  t.empty();
	  		  ctxt && that.optionToSelect('',ctxt,t);
	  		  $.each(nextAll,function(i,txt){
	  			  that.optionToSelect(i,txt,t);
	  			});
	  		  if(_v && nextAll[_v]){
	  			  t.val(_v);
	  		  } 
	  		  t.change();
  		 }
  	  }).change();
    },
    
    
    findByName:function(name,doc){
    	return jQuery(document.getElementsByName(name),doc||"*").map(function(index, element) {
    		return element.name == name && element  || null;
    	});
    }
};
  
})(jQuery);