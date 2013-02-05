$run(function() {
	eval($global.all);

	/**
	 * Object的默认包装器
	 */
	var IMObject = {
		target: 'object',
		/**
		 * 返回对象的成员
		 * @param {String} member
		 */
		get: 'function(name)',
		/**
		 * 给对象成员赋值
		 * @param {String} member
		 * @param {Object} value
		 */
		set: 'function(member, value)',
		/**
		 * 调用对象的一个方法
		 * @param {String} funcName
		 * @param {Array} args
		 */
		invoke: 'function(funcName, args)',
		/**
		 * 使用wrapper包装自己
		 * @param {String} wrapperName 包装模块的名称
		 */
		wrapWith: 'function(wrapperName)',
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 * 声明对象实现了指定接口
		 * @param {IInterface|IInterface[]} 接口
		 */
		implement: 'function(protocol)'
	};

	var MObject = $module({
		onIncluded: function(){
			$implement(IMObject, this);
		},
		get: function(member) {
			return this.target[member];
		},
		set: function(member, value) {
			this.target[member] = value;
			return this;
		},
		invoke: function(funcName, args){
			return this.target[funcName].apply(this.target, args);
		},
		wrapWith: function(wrapperName){
			$$(this, wrapperName);
			return this;
		},
		implement: function(protocol){
			$implement(protocol, this.target);
			return this;
		},
		include: function(module) {
			$include(module, this.target);
			return this;
		}
	});

	$.regWrapper(MObject, Object);

	z.IMObject = IMObject;
	z.MObject = MObject;
});
