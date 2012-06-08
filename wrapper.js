$run(function() {
	eval($global.all);

	var IWrapper = $interface({
		scope: 'object',
		get: 'function(k)',
		set: 'function(k, v)',
		invoke: 'function(fn, args)'
	});

	function Wrapper(o) {
		this.scope = o;
		$everyKey(o, function(key, value) {
			if (o.hasOwnProperty(key) && $is('function', value)) {
				this[key] = function() {
					value.apply(this.scope, arguments);
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
		invoke: function(fn, args) {
			return this.scope[fn].apply(this.scope, args);
		},
		to: function(){
			return this.scope[fn].apply(this.scope, args);
		}
	}

	Wrapper.bind = function(obj) {
		var one = {};
		$everyKey(obj, function(k, v) {
			if (v && $is('function', v)) {
				one[k] = function() {
					return v.apply(this.scope, arguments);
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
			prototype: proto
		});
		return w;
	}

	$.regist(Wrapper, Object, "@object");
	$.setDefault(Object, "@object");

	$global("Wrapper", Wrapper);
	$global("$wrapper", $wrapper);
});
