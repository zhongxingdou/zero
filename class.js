$run(function() {
	eval($global.all);

	/*
	 *定义类对象的接口
	 */
	var IClass = { type: "function" };


	var supportProto = {}.__proto__ !== undefined;

	/*
	 * 原型继承
	 * @param {IClass} fnClazz
	 * @param {Object} prototype
	 * @description 
	 */
	function $extend(clazz, base) {
		var old = clazz.prototype;
		
		var fn = function() {};
		fn.prototype = base.prototype;
		clazz.prototype = new fn();

		var proto = clazz.prototype;
		if(old){
			$copy(old, proto);
		}

		proto.constructor = clazz;
		clazz.baseProto = base.prototype;
	}

	var Clazz = $module({
		extend: function(base){
			$extend(this.target, base);
			delete this.extend;
			return this;
		},
		implement: function(interfaces){
			var implns = this.target.prototype.implns || [];
			this.target.prototype.implns = implns.concat(interfaces);
			return this;
		},
		include: function(module, option){
			$include(module, this.target.prototype, {Class: this.target});
		}
	});

	$.regist(Clazz, Function, "@functionAsClass");

	$class = function(fn){
		return $(fn, "@functionAsClass");
	}

	$global("IClass", IClass);
	$global("$class", $class);
	$global("$extend", $extend);
});
