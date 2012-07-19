$run(function(){
	eval($global.all);
	
	/**
	 * 事件
	 * @module
	 */
	var MEvent = $module({
		/**
		 * 被包含时初始化引用监听者的map
		 */
		onIncluded: function(){
			this.__listeners = {};
		},
		/**
		 * 添加监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		addListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)all = this.__listeners[eventName] = [];
			all.push(listener);
			return this;
		},
		/**
		 * 移除监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		removeListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)return;
			this.__listeners[eventName] = all.filter(function(item){return item != listener});
			return this;
		},
		/**
		 * 获取所有监听者
		 * @param {String} eventName 事件名
		 */
		getListerners: function(eventName){
			return this.__listeners[eventName];
		},
		/**
		 * 触发事件
		 * @param {String} eventName 事件名
		 * @param {Array} args 传递给事件监听者的参数
		 */
		fire: function(eventName, args){
			this.getListerners(eventName).forEach(function(listener){
				listener(args);
			});
			return this;
		}
	});

	z.MEvent = MEvent;
});
