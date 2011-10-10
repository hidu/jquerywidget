if(!$.browser.msie){
var h='<link href="http://alexgorbatchev.com/pub/sh/current/styles/shCore.css" rel="stylesheet" type="text/css" />';
	h+='<link href="http://alexgorbatchev.com/pub/sh/current/styles/shThemeDefault.css" rel="stylesheet" type="text/css" />';
	h+='<script src="http://alexgorbatchev.com/pub/sh/current/scripts/shCore.js" type="text/javascript"></script>';
	h+='<script src="http://alexgorbatchev.com/pub/sh/current/scripts/shBrushXml.js" type="text/javascript"></script>';
	document.write(h);
    document.write("<style>.syntaxhighlighter{overflow:hidden !important}</style>");
}
$(function(){
	  $('.demo').each(function(){
	      $(this).append("<br/><pre class='brush: html'>"+$(this).html().replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</pre>");
	  });
	  if(!$.browser.msie){
		  try{
			  SyntaxHighlighter.defaults['toolbar'] = false;
			  SyntaxHighlighter.defaults['gutter'] = false;
			  SyntaxHighlighter.defaults['quick-code'] = false;
			  SyntaxHighlighter.defaults['auto-links'] = false;
			  SyntaxHighlighter.all();
		  }catch(e){alert(e.message)}
	  }
});

