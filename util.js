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
	 */
	function $copy(from, to) {
		var p;

		for (p in from) {
			to[p] = from[p];
		}

		return to;
	}

	/**
	 * 将以逗号分隔的参数转换成Option，并合并默认参数
	 * @example
	 * function fn(p1, p2){
	 *     var oDefault = {key1: null, key2: null, key3: true};
	 *     var option = $option(oDefault, arguments);
	 *     ....
	 * }
	 */
	function $option(oDefault, args) {
		var option = {},
		args = args || $option.caller.arguments,
		l = args.length;

		if (l == 1) {
			return $merge(oDefault, args[0]);
		}

		var k, i = 0;
		for (k in oDefault) {
			if (i < l) {
				option[k] = args[i];
				i++;
			} else {
				option[k] = oDefault[k];
			}
		}

		return option;
	}

	/**
	 * 如果目标已经存在,则不覆盖
	 * @example
	 * function fn(args){
	 *     var dftOption = {param: true}
	 *     $merge(dftOption, args);
	 * }
	 */
	function $merge(from, to) {
		var p;

		for (p in from) {
			if (!(p in to)) {
				to[p] = from[p];
			}
		}

		return to;
	}


	/**
	 * clone对象
	 * @param {Ojbect} o 
	 * @param {Boolean} isDeepClone=false
	 */
	function $clone(o, isDeepClone) {
		if (o.constructor == Object) {
			newo = {}
		} else {
			newo = new o.constructor(o.valueOf());
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

	function $like(a, b) {
		if (a == b) return true;

		if (typeof a != typeof b) return false;

		for (var k in a) {
			if (a[k] != b[k]) {
				if (!$like(a[k], b[k])) return false;
			}
		}
		return true;
	}

	$global("$each", $each);
	$global("$copy", $copy);
	$global("$makeArray", $makeArray);
	$global("$clone", $clone);
	$global("$like", $like);
	$global("$merge", $merge);
	$global("$option", $option);
})();

