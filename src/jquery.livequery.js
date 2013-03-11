(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function ($, undefined) {

(function ($, window, undefined) {

var DOMSubtreeModified = 'DOMSubtreeModified',
	DOMNodeInserted = 'DOMNodeInserted',
	DOMNodeRemoved = 'DOMNodeRemoved',
	DOMNodeInsertedIntoDocument = 'DOMNodeInsertedIntoDocument',
	DOMNodeRemovedFromDocument = 'DOMNodeRemovedFromDocument',
	DOMAttrModified = 'DOMAttrModified',
	DOMCharacterDataModified = 'DOMCharacterDataModified',
	document = window.document,
	body = 'body';

function _match(me, query, fn, fn2) {
	return me.selector == query.selector &&
		me.context == query.context &&
		(!fn || fn.$lqguid == query.fn.$lqguid) &&
		(!fn2 || fn2.$lqguid == query.fn2.$lqguid);
}

$.extend($.fn, {
	livequery: function(fn, fn2) {
		var me = this, q;

		// See if Live Query already exists
		$.each( $jQlq.queries, function(i, query) {
			if ( _match(me, query, fn, fn2) )
					// Found the query, exit the each loop
					return (q = query) && false;
		});

		// Create new Live Query if it wasn't found
		q = q || new $jQlq(me.selector, me.context, fn, fn2);

		// Make sure it is running
		q.stopped = false;

		// Run it immediately for the first time
		q.run();

		// Contnue the chain
		return me;
	},

	expire: function(fn, fn2) {
		var me = this;

		// Find the Live Query based on arguments and stop it
		$.each( $jQlq.queries, function(i, query) {
			if ( _match(me, query, fn, fn2) && !me.stopped)
					$jQlq.stop(query.id);
		});

		// Continue the chain
		return me;
	}
});

var $jQlq = $.livequery = function(selector, context, fn, fn2) {
	var me = this;

	me.selector = selector;
	me.context  = context;
	me.fn       = fn;
	me.fn2      = fn2;
	me.elements = $([]);
	me.stopped  = false;

	// The id is the index of the Live Query in $.livequiery.queries
	me.id = $jQlq.queries.push(me)-1;

	// Mark the functions for matching later on
	fn.$lqguid = fn.$lqguid || $jQlq.guid++;
	if (fn2) fn2.$lqguid = fn2.$lqguid || $jQlq.guid++;

	// Return the Live Query
	return me;
};

$jQlq.prototype = {
	stop: function() {
		var me = this;
		// Short-circuit if stopped
		if ( me.stopped ) return;

		if (me.fn2)
			// Call the second function for all matched elements
			me.elements.each(me.fn2);

		// Clear out matched elements
		me.elements = $([]);

		// Stop the Live Query from running until restarted
		me.stopped = true;
	},

	run: function() {
		var me = this;
		// Short-circuit if stopped
		if ( me.stopped ) return;

		var oEls = me.elements,
			els  = $(me.selector, me.context),
			newEls = els.not(oEls),
			delEls = oEls.not(els);

		// Set elements to the latest set of matched elements
		me.elements = els;

		// Call the first function for newly matched elements
		newEls.each(me.fn);

		// Call the second function for elements no longer matched
		if ( me.fn2 )
			delEls.each(me.fn2);
	}
};

$.extend($jQlq, {
	guid: 0,
	queries: [],
	queue: [],
	running: false,
	timeout: null,
	registered: [],

	checkQueue: function() {
		if ( $jQlq.running && $jQlq.queue.length ) {
			var length = $jQlq.queue.length;
			// Run each Live Query currently in the queue
			while ( length-- )
				$jQlq.queries[ $jQlq.queue.shift() ].run();
		}
	},

	pause: function() {
		// Don't run anymore Live Queries until restarted
		$jQlq.running = false;
	},

	play: function() {
		// Restart Live Queries
		$jQlq.running = true;
		// Request a run of the Live Queries
		$jQlq.run();
	},

	registerPlugin: function() {
		$.each( arguments, function(i,n) {
			// Short-circuit if the method doesn't exist
			if (!$.fn[n] || $.inArray(n, $jQlq.registered) > 0) return;

			// Save a reference to the original method
			var old = $.fn[n];

			// Create a new method
			$.fn[n] = function() {
				// Call the original method
				var r = old.apply(this, arguments);

				// Request a run of the Live Queries
				$jQlq.run();

				// Return the original methods result
				return r;
			};

			$jQlq.registered.push(n);
		});
	},

	run: function(id) {
		if (id !== undefined) {
			// Put the particular Live Query in the queue if it doesn't already exist
			if ( $.inArray(id, $jQlq.queue) < 0 )
				$jQlq.queue.push( id );
		}
		else
			// Put each Live Query in the queue if it doesn't already exist
			$.each( $jQlq.queries, function(id) {
				if ( $.inArray(id, $jQlq.queue) < 0 )
					$jQlq.queue.push( id );
			});

		// Clear timeout if it already exists
		if ($jQlq.timeout) clearTimeout($jQlq.timeout);
		// Create a timeout to check the queue and actually run the Live Queries
		$jQlq.timeout = setTimeout($jQlq.checkQueue, 20);
	},

	stop: function(id) {
		if (id !== undefined)
			// Stop are particular Live Query
			$jQlq.queries[ id ].stop();
		else
			// Stop all Live Queries
			$.each( $jQlq.queries, $jQlq.prototype.stop);
	}
});

var _run = function () { $jQlq.run(); },
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

if (MutationObserver) {

	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(_run);
	});
	observer.observe(document, { 
		attributes: true, 
		subtree: true,
		childList: true,
		characterData: true,
		attributeOldValue: true,
		characterDataOldValue: true
	});
} else {
	$(function () {
		var caps = (function () {
			var caps = {},
				eventTypes = [
					DOMSubtreeModified, 
					DOMNodeInserted, 
					DOMNodeRemoved, 
					DOMNodeInsertedIntoDocument, 
					DOMNodeRemovedFromDocument, 
					DOMAttrModified, 
					DOMCharacterDataModified
				],
				div = $('<div>');

			for (var i = 0; i < eventTypes.length; i++) {
				var eventType = eventTypes[i];
				caps[eventType] = false;
				div.bind(eventType, function (evt) {
					caps[evt.type] = true;
				});
			}

			div.appendTo(body).attr(body, body).detach().remove();

			return caps;
		})();

		if (caps[DOMSubtreeModified]) {
			$(document).bind(DOMSubtreeModified, _run);
		} else {
			if (caps[DOMNodeInserted]) {
				$(document).bind(DOMNodeInserted, _run);
			} else if (caps[DOMNodeInsertedIntoDocument]) {
				$(document).bind(DOMNodeInsertedIntoDocument, _run);
			} else {
				$jQlq.registerPlugin('append', 'prepend', 'after', 'before', 'wrap', 'html');
			}
			if (caps[DOMNodeRemoved]) {
				$(document).bind(DOMNodeRemoved, _run);
			} else if (caps[DOMNodeRemovedFromDocument]) {
				$(document).bind(DOMNodeRemovedFromDocument, _run);
			} else {
				$jQlq.registerPlugin('empty', 'remove', 'html'); 
			}
		}
		if (caps[DOMAttrModified]) {
			$(document).bind(DOMAttrModified, _run);
		} else {
			$jQlq.registerPlugin('attr', 'removeAttr', 'addClass', 'removeClass', 'toggleClass', 'prop', 'removeProp', 'html');
		}
	});
}
// Run Live Queries when the Document is ready
$(function() { $jQlq.play(); });

})(jQuery, window);