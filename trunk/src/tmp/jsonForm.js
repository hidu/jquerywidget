/**
*author duwei<duv123@gmail.com>
*  将 表单进行serializeArray化后的数组a转换为json
*  var a=$('#form1 :input').serializeArray();
*  var b=jsonForm(a);
*  console.log(b);
*/
function jsonForm(a){
    var json={};
    var c=[],b=[];    
       $.each(a,function(i,v){
           var name=v['name'];
           if(name.substr(-2)=="[]"){
               name=name.substr(0,name.length-2);
               c[name]=c[name]||[];
               c[name].push(v['value']);
             }else{
                b.push(v);
             }
        });
     for(var d in c){
         for(var e in c[d]){
            b.push({name:d+"["+e+"]",value:c[d][e]});
         }
     };
    $.each(b,function(i,v){
        var name=v['name'],value='"'+v['value'].replace(/\"/g,"\\\"")+'"';
        name=name.replace(/\]\[/g,"[").replace().replace(/\[/g,":{").replace(/\]/g,":");
        var bn=name.split("{").length-1;
        if(name.substr(-1)!=":")name+=":";
        var str=name.replace(/{/g,'{"').replace(/:/g,'":')+value;
        for(var j=0;j<bn;j++){
           str+="}";
         }
        str="{\""+str+"}";
        var m=$.parseJSON(str);
        $.extend(true,json,m);
    });
    return json;
}
