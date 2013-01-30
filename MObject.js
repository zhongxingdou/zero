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
		 * 调用对象的一个方法，并可指定作为this的对象
		 * @param {String} funcName
		 * @param {Object} thisp
		 */
		callFn: 'function(funcName, thisp/*, arg1, arg2,...**/)',
		/**
		 * 调用对象的一个方法，并可指定作为this的对象
		 * @param {String} funcName
		 * @param {Object} thisp
		 * @param {Array} args
		 */
		applyFn: 'function(funcName, thisp, args)',
		/**
		 * 使用wrapper包装自己
		 * @param {String} wrapperName 包装模块的名称
		 */
		wrap: 'function(wrapperName)',
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 * 声明对象实现了指定接口
		 * @param {IInterface|IInterface[]} 接口
		 */
		implement: 'function(ainterface)'
	}

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
		callFn: function(funcName, thisp/*, arg1, arg2,...**/) {
			return this.target[funcName].apply(thisp, z._slice(arguments, 2));
		},
		applyFn: function(funcName, thisp, args){ 
			return this.target[funcName].apply(thisp, args);
		},
		wrap: function(wrapperName){
			$$(this, wrapperName);
			return this;
		},
		implement: function(ainterface){
			$implement(ainterface, this.target);
			return this;
		},
		include: function(module) {
			$include(module, this.target);
			return this;
		}
	});

	$.regist(MObject, Object);

	z.IMObject = IMObject;
	z.MObject = MObject;
});
