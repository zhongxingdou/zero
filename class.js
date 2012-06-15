$run(function() {
	eval($global.all);

	/**
	 * 定义类对象的接口
	 */
	var IClass = {
		type: "function",
		member: {
			implns: {instanceOf: Array, optional: true}
		}
	};


	var supportProto = {}.__proto__ !== undefined;

	/**
	 * 原型继承
	 * @param {IClass} fnClazz
	 * @param {Object} prototype
	 * @description 
	 * 让function的prototype与另一个prototype合并，并设置成员baseProto来引用它。
	 */
	function $extend(clazz, baseProto) {
		var old = clazz.prototype;

		
		var fn = function() {};
		fn.prototype = baseProto;
		clazz.prototype = new fn();

		var proto = clazz.prototype;
		if(old){
			$copy(old, proto);
		}

		proto.constructor = clazz;
		if(!supportProto){
			proto['__proto__'] = baseProto;
		}
	}

	var Clazz = $wrapper({
		extend: function(base){
			$extend(this.target, base.prototype || base);
			delete this.extend;
			return this;
		},
		implement: function(interfaces){
			this.target.implns = [].concat(interfaces);
			return this;
		},
		include: function(module, option){
			$include(module, this.target.prototype, {Class: this.target});
		}
	});

	$.regist(Clazz, Function, "@class");

	$class = function(fn){
		return $(fn, "@class");
	}

	$global("IClass", IClass);
	$global("$class", $class);
	$global("$extend", $extend);
});
