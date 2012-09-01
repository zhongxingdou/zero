$run(function() {
	eval($global.all);

	/**
	* @interface
	*/
	var IClass = {
		type: "function",
		member: {
			"baseProto": {type: "object", required: false},
			"__implementations__": {type: "Array", required: false}
		}
	}

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
		onIncluded: function() {
			$implement(this, [IObject, IClass]);
		},
		/**
		 * 继承一个类
		 * @param {Object} base
		 */
		extend: function(base){
			$extend(this.target, base);
			delete this.extend; //防止多继承,只能用一次
			return this;
		},
		/**
		 * 添加类的实现接口名单
		 * @param {Object|Array} interfaces
		 */
		implement: function(ainterface){
			var proto = this.target.prototype;
			//是要添加到类的原型对象上，而不是类本身，所以需要原型存在
			if(proto){
				$implement(proto, ainterface);
			}
			return this;
		},
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: function(module){
			$include(module, this.target.prototype);
			return this;
		}
	});

	$.regist(MClass, Function, "toClass");

	z.IClass = IClass;

	z.MClass = MClass;

	$global("$extend", $extend);
});
