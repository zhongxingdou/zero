/**
 * clone对象
 * @param {Ojbect} o 
 * @param {Boolean} isDeepClone=false
 */
function $clone(o, isDeepClone) {
	var newo;
	if (o.constructor == Object) {
		newo = {}
	} else {
		var fn = function() {};
		fn.prototype = o.constructor.prototype;
		newo = new fn();
		//newo = new o.constructor(o.valueOf());
	}

	if (!isDeepClone) {
		for (var key in o) {
			newo[key] = o[key];
		}
	} else {
		for (var key in o) {
			var v = o[key];
			if (newo[key] != v) { //防止循环clone
				if (typeof(v) == 'object') {
					newo[key] = $clone(v);
				} else {
					newo[key] = v;
				}
			}
		}
	}

	newo.toString = o.toString;
	newo.valueOf = o.valueOf;

	return newo;
}

