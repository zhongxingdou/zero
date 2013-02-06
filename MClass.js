$run(function() {
	eval($global.all);

	/**
	* @protocol
	*/
	var PClass = {
		type: "function",
		member: {
			"baseProto": {type: "object", required: false},
			"__implns__": {type: "Array", required: false},
			"__cls_implns__": {type: "Array", required: false}
		}
	};

	/**
	 * @module
	 */
	var MClass = $module({
		onIncluded: function() {
			this.__cls_implns__ = [];
			this.implement(PClass);
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

	$.regWrapper(MClass, Function, "MClass");

	z.PClass = PClass;

	z.MClass = MClass;

	function $class(m){
		return $(m).wrapWith("MClass");
	}
	$global("$class", $class);
});
