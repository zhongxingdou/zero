$run(function() {
	eval($global.all);

	/**
	 * Object的默认包装器
	 */
	var IObjectWrapper = {
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
		call: 'function(funcName, thisp/*, arg1, arg2,...**/)',
		/**
		 * 调用对象的一个方法，并可指定作为this的对象
		 * @param {String} funcName
		 * @param {Object} thisp
		 * @param {Array} args
		 */
		apply: 'function(funcName, thisp, args)',
		/**
		 * 使用wrapper包装自己
		 * @param {Module} wrapper
		 */
		wrap: 'function(wrapper)'
	};

	var MObjectWrapper = $module({
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
		call: function(funcName, thisp/*, arg1, arg2,...**/) {
			return this.target[funcName].apply(thisp, $slice(arguments, 2));
		},
		apply: function(funcName, thisp, args){ 
			return this.target[funcName].apply(thisp, args);
		},
		wrap: function(wrapper){
			var ws = $.findWrapper(this.target, wrapper);
			var w;
			while(w=ws.pop()){
				$include(w, this);
			}
			return this;
		}
	});


	$.regist(MObjectWrapper, Object, "@object");

	$.setDefault(Object, "@object");
});
