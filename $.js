(function() {
	/**
	 * 将源对象包装成另一个对象，并且不污染源对象
	 */
	I$ = $interface({
		type: "function",
		member: {
			//注册一个wrapper
			regist: "function(wrapper, interface)",

			//反注册一个wrapper
			unregist: "function(wraper, interface)",

			//根据interface获取一个wrapper
			getWrapper: "function(interface)",

			//查找对象的wrapper
			findWrappers: "function(o)"
		}
	});

	function $(o) {
		var wps = $.findWrappers(o);

		//clone对象确保对象不会被污染
		var so = typeof o == "object" ? $clone(o) : o;

		var w;

		while(w = wps.shift()){
			so = w(so);
		}

		return so;
	}

	$.__wrapper = {};

	$.regist = function(interface, wrapper) {
		this.__wrapper[interface] = wrapper;
	}

	$.unregist = function(interface) {
		delete this.__wrapper[interface];
	}

	$.getWrapper = function(interface) {
		return this.__wrapper[interface];
	}

	$.findWrappers = function(o) {
		var wps = [];
		var t = typeof o;
		var w = this.getWrapper(t);
		if (w) wps.push(w);

		if (typeof o === "object") {
			if(o.eachBase){
				o.eachBase(o, function(base){
					wps = $.findWrappers(base).concat(wps);
				});
			}

			var fn = o.constructor;
			var w1 = this.getWrapper(fn)
			if (w1) wps.push(w1);

			//处理实现的接口
			var faces = fn.implements;
			if(faces && faces.length){
				var f;
				while(f = faces.shift()){
					var w = this.getWrapper(f);
					w && wps.push(w);
				}
			}
		}
		return wps;
	}


	$global("$", $);
})();

