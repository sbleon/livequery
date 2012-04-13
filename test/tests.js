(function ($) {
	$(function(){
		test("could stop livequery two times", function() {
			// add live query
			$('div').livequery(function (){} , function() {}); 
			// stop all queries
			$.livequery.stop();
			// add another live query
			$('div').livequery(function (){} , function() {});
			// should not fail
			$.livequery.stop();
			
			ok(true);
		});
	});
})(jQuery);