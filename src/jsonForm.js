function jsonForm(a){
    var json={};    
    $.each(a,function(i,v){
        var name=v['name'],value='"'+v['value']+'"';
        name=name.replace(/\]\[/g,"[").replace().replace(/\[/g,":{").replace(/\]/g,":");
        var bn=name.split("{").length-1;
        var str=name.replace(/{/g,'{"').replace(/:/g,'":')+value.replace(/"/g,'\"');
        for(var j=0;j<bn;j++){
        str+="}";
        }
        str="{\""+str+"}";
        var m=$.parseJSON(str);
//        console.log(m);
        $.extend(true,json,m);
    });
    return json;
}
