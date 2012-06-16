$run(function() {
	eval($global.all);

	var IWrapper = {
		target: 'object',
		get: 'function(k)',
		set: 'function(k, v)',
		invoke: 'function(fn, args)'
	};

	function Wrapper(o) {
		this.target = o;
		$everyKey(o, function(key, value) {
			/**
			 * 因为$会调用$traceProto来包装所有proto，所以只需要包装对象自己拥有
			 * 的成员，而不是原型链上的
			 */
			if (o.hasOwnProperty(key) && $is('function', value)) {
				this[key] = function() {
					return value.apply(this.target, arguments);
				};
			}
		},
		this);
	}

	Wrapper.prototype = {
		get: function(k) {
			return this.target[k];
		},
		set: function(k, v) {
			this.target[k] = v;
			return this;
		},
		invoke: function(fn, args) {
			return this.target[fn].apply(this.target, args);
		},
		to: function(wrapper){
			return $(this.target, wrapper);
		}
	}

	Wrapper.bind = function(obj) {
		var one = {};
		$everyKey(obj, function(k, v) {
			if (v && typeof v == "function") {
				one[k] = $fn(function() {
					return v.apply(this.target, arguments);
				});
			}
		});
		return one;
	}

	//$class(Wrapper, {
		//base: $Object,
		//implementions: IWrapper
	//});



	$.regist(Wrapper, Object, "@object");
	$.setDefault(Object, "@object");

	$global("Wrapper", Wrapper);
	$global("$wrapper", $wrapper);
});
