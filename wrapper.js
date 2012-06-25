$run(function() {
	eval($global.all);

	var IWrapper = {
		target: 'object',
		get: 'function(k)',
		set: 'function(k, v)',
		invoke: 'function(fn, args)',
		call: 'function(fnName, scope)',
		apply: 'function(fnName, scope, args)',
		wrapWith: 'function(wrapper)'
	};

	var MObjectWrapper = $module({
		get: function(k) {
			return this.target[k];
		},
		set: function(k, v) {
			this.target[k] = v;
			return this;
		},
		invoke: function(fnName, args){
			return this.target[fnName].apply(this.target, $slice(arguments, 1));
		},
		call: function(fnName, scope/**args...**/) {
			return this.target[fnName].apply(scope, $slice(arguments, 2));
		},
		apply: function(fnName, scope, args){ 
			return this.target[fn].apply(scope, args);
		},
		wrapWith: function(wrapper){
			var ws = $.findWrapper(this.target, wrapper);
			var w;
			while(w=ws.pop()){
				$mix(w, this);
			}
			return this;
		}
	});


	$.regist(MObjectWrapper, Object, "@object");
	$.setDefault(Object, "@object");
});
