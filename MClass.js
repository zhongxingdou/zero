$run(function() {
	eval($global.all);

	/**
	* @protocol
	*/
	var IClass = {
		type: "function",
		member: {
			"baseProto": {type: "object", required: false},
			"__implns__": {type: "Array", required: false},
			"__cls_implns__": {type: "Array", required: false}
		}
	}

	/**
	 * @module
	 */
	var MClass = $module({
		onIncluded: function() {
			this.__cls_implns__ = [];
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
		classImplement: function(protocol){
			if(!this.target.__cls_implns__)this.target.__cls_implns__ = [];
			z._uniqPush(this.target.__cls_implns__, protocol);
			return this.target;
		},
		getClassImplns: function() {
			return this.target.__cls_implns__;
		}
	});

	$.regist(MClass, Function, "toClass");

	z.IClass = IClass;

	z.MClass = MClass;

	function $class(m){
		return $$(m).toClass();	
	}
	$global("$class", $class);
});
