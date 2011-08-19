;(function($) {
	function tab(A, _) {
		var C = $(A), B = $(_);
		C.click(function() {
			var _ = C.index(this);
			C.removeClass("cur");
			$(this).addClass("cur");
			B.hide().eq(_).show();
		});
		if(C.filter('.cur').size()<1)C.eq(0).addClass("cur");
		C.filter('.cur').trigger('click');
	}
	$.extend(jw, {
		tab: tab
	})
})(jQuery);
