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
			$implement(PClass, this);
		},
		/**
		 * 继承一个类
		 * @param {Object} base
		 */
		extend: function(base){
			$extend(this, base);
			delete this.extend; //防止多继承,只能用一次
			return this;
		},
		classImplement: function(protocol){
			if(!this.__cls_implns__)this.__cls_implns__ = [];
			z._uniqPush(this.__cls_implns__, protocol);
			return this;
		},
		getClassImplns: function() {
			return this.__cls_implns__;
		}
	});

	$.regWrapper(MClass, Function, "MClass");

	z.PClass = PClass;

	z.MClass = MClass;

	function $class(m){
		return $$(m,"MClass");
	}
	$global("$class", $class);
});
