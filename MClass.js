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

	/**
	 * @module
	 */
	var MClass = {
		onIncluded: function() {
			this.implement(IClass);
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
		implementToProto: function(ainterface){
			var proto = this.target.prototype;
			//是要添加到类的原型对象上，而不是类本身，所以需要原型存在
			if(proto){
				$implement(ainterface, proto);
			}
			return this;
		},
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		includeToProto: function(module){
			$include(module, this.target.prototype);
			return this;
		}
	}

	$$(MClass).toModule();

	$.regist(MClass, Function, "toClass");

	z.IClass = IClass;

	z.MClass = MClass;

	function $class(m){
		return $$(m).toClass();	
	}
	$global("$class", $class);
});
