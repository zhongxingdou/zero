$run(function(){
	eval($global.all);

	var IEvent = {
		addListener: "function(event, listener)",
		on: "function(event, listener)",
		removeListener: "function(event, listener)",
		un: "function(event, listener)",
		getListerners: "function(event)",
		fire: "function(event, args)"
	}
	
	/**
	 * 事件
	 * @module
	 */
	var MEvent = {
		/**
		 * 被包含时初始化引用监听者的map
		 */
		onIncluded: function(){
			this.target.__listeners = {};
		},
		/**
		 * 添加监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		addListener: function(eventName, listener){
			var all = this.target.__listeners[eventName];
			if(!all)all = this.target.__listeners[eventName] = [];
			all.push(listener);
			return this;
		},
		/**
		 * 移除监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		removeListener: function(eventName, listener){
			var all = this.target.__listeners[eventName];
			if(!all)return;
			this.target.__listeners[eventName] = all.filter(function(item){return item != listener});
			return this;
		},
		/**
		 * 获取所有监听者
		 * @param {String} eventName 事件名
		 */
		getListerners: function(eventName){
			return this.target.__listeners[eventName];
		},
		/**
		 * 触发事件
		 * @param {String} eventName 事件名
		 * @param {Array} args 传递给事件监听者的参数
		 */
		fire: function(eventName, args){
			this.target.getListerners(eventName).forEach(function(listener){
				listener(args);
			});
			return this;
		}
	}

	$$(MEvent).toModule().implement(IEvent);

	z.MEvent = MEvent;
});
