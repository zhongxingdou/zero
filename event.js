$run(function(){
	eval($global.all);
	
	this.MEvent = $module({
		onIncluded: function(){
			this.__listeners = {};
		},
		addListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)all = this.__listeners[eventName] = [];
			all.push(listener);
			return this;
		},
		removeListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)return;
			this.__listeners[eventName] = all.filter(function(item){return item != listener});
			return this;
		},
		getListerners: function(eventName){
			return this.__listeners[eventName];
		},
		fire: function(eventName, args){
			this.getListerners(eventName).forEach(function(listener){
				listener(args);
			});
			return this;
		}
	});

	$global(this);
});
