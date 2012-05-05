(function() {
	function $each(obj, fn) {
		if (!obj) return true;
		for (var i = 0, l = obj.length; i < l; i++) {
			if (fn(obj[i]) === false) return false;
		}
		return true;
	}

	/**
	 * 把集合对象转换成Array
	 * @param {Object} obj 被转换的对象
	 * @param {Object} start=0 从集合对象中的第几项开始转换 
	 */
	function $makeArray(obj, start) {
		return Array.prototype.slice.apply(obj, [start || 0]);
	}

	/**
	 * copy对象成员到另一个对象
	 * @param {Object} from
	 * @param {Object} to
	 * @param {Boolean} overwrite = true 是否覆盖目标对象已存在的成员
	 */
	function $copy(args) {
		var from = args.from,
		to = args.to,
		overwrite = args.overwrite;

		if (! (from && to)) return;

		if (overwrite === false) {
			for (var p in from) {
				if (! (p in to)) {
					to[p] = from[p];
				}
			}
		} else {
			for (var p in from) {
				to[p] = from[p];
			}
		}
	}

	/**
	 * clone对象
	 */
	function $clone(o) {
		var deft = {target: null, isDeepClone: false };

		if (!$support(o, {member: {target:"object", isDeepClone: "[boolean]"}})) {
			o = {
				target: o
			};
		}

		$copy({
			from: deft,
			to: o,
			overwrite: false
		});

		var t = o.target;
		var newo;

		if (t.constructor == Object) {
			newo = {}
		} else {
			newo = new t.constructor(t.valueOf());
		}

		if (!o.isDeepClone) {
			for (var key in t) {
				newo[key] = t[key];
			}
		} else {
			for (var key in t) {
				var v = t[key];
				if (newo[key] != v) { //防止循环clone
					if (typeof(v) == 'object') {
						newo[key] = $clone(v);
					} else {
						newo[key] = v;
					}
				}
			}
		}

		newo.toString = t.toString;
		newo.valueOf = t.valueOf;

		return newo;
	}

	function $like(a, b){
		if(a==b)return true;

		if(typeof a != typeof b)return false;

		for(var k in a){
			if(a[k] != b[k]){
				if(!$like(a[k], b[k]))return false;
			}
		}
		return true;
	}

	$global("$each", $each);
	$global("$copy", $copy);
	$global("$makeArray", $makeArray);
	$global("$clone", $clone);
	$global("$like", $like);
})();

