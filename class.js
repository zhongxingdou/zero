$run(function() {
	eval($global.all);

	/*
	 *定义类对象的接口
	 */
	var IClass = { type: "function" };

	/*
	 * 原型继承
	 * @param {Class} clazz
	 * @param {Object} base
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

	/**
	 * @module
	 */
	var MClass = $module({
		/**
		 * 继承一个类
		 * @param {Object} base
		 */
		extend: function(base){
			$extend(this.target, base);
			delete this.extend;
			return this;
		},
		/**
		 * 添加类的实现接口名单
		 * @param {Array} interfaces
		 */
		implement: function(interfaces){
			var implns = this.target.implns || [];
			this.target.implns = implns.concat(interfaces);
			return this;
		},
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: function(module){
			$include(module, this.target.prototype);
			if(module.implns){
				this.implement(module.implns);
			}
		}
	});

	$.regist(MClass, Function, "@functionAsClass");

	/**
	 * 将构造函数包装成类
	 */
	$class = function(fn){
		return $(fn, "@functionAsClass");
	}

	z.MClass = MClass;

	$global("$class", $class);

	$global("$extend", $extend);
});
