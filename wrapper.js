(function() {
	var IWrapper = $interface({
		scope: 'object',
		get: 'function(k)',
		set: 'function(k, v)',
		call: 'function(fn, args)',
	});

	function Wrapper(o) {
		this.scope = o;
		$eachKey(o, function(key, value) {
			if (o.hasOwnProperty(key) && $is('function', value)) {
				this[key] = function() {
					value.apply(this.scope, $array(arguments));
				}
			}
		},
		this);
	}

	Wrapper.prototype = {
		get: function(k) {
			return this.scope[k];
		},
		set: function(k, v) {
			this.scope[k] = v;
			return this;
		},
		call: function(fn, args) {
			return this.scope[fn].apply(this.scope, args);
		}
	}

	Wrapper.bind = function(obj) {
		var one = {};
		$eachKey(obj, function(k, v) {
			if (v && $is('function', v)) {
				one[k] = function() {
					return v.apply(this.scope, $array(arguments));
				}
			}
		});
		return one;
	}

	$class(Wrapper, {
		base: $Object,
		implementions: IWrapper
	});

	function $wrapper(obj) {
		var proto = Wrapper.bind(obj);
		var w = $class({
			base: Wrapper,
			prototype: proto
		});
		return w;
	}

	$global("Wrapper", Wrapper);
	$global("$wrapper", $wrapper);
})();
