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

		test("Should call fn2 on stop", function() {
			var q1called = false;
			var q2called = false;
			$('div').livequery(function (){}, function() { q1called = true; console.debug(this); }); 
			$('div').livequery(function (){}, function() { q2called = true; });
			$.livequery.stop();
			
			ok(q1called, "stop called for first query");
			ok(q2called, "stop called for second query");
		});
	});
})(jQuery);