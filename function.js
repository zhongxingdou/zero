function callWithArgsArray(fn, array, scope) {
	if (!$is(Array, array)) {
		array = [array];
	}
	$each(array, function(args) {
		fn.apply(scope, args);
	});
}

function $function(fn) {
	fn.callWithArgsArray = callWithArgsArray;
}

$.regist($function, [Function, "function"]);

