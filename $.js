(function() {
	I$ = $interface({
		type: "function"
	});

	function $(o) {
		var wps = $.findWrappers(o);

		var so = o;
		for (var i = 0, l = wps.length; i < l; i++) {
			so = wps[i](so);
		}

		return so;
	}

	$.__wrapper = {};

	$.regist = function(wrapper, interface) {
		this.__wrapper[interface] = wrapper;
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
			var fn = o.constructor;
			var w1 = this.getWrapper(fn)
			if (w1) wps.push(w1);
			var faces = fn.implements;
			for (var i = 0, l = faces.length; i < l; i++) {
				var wi = this.getWrapper(faces[i]);
				if (wi) wps.push(wi);
			}
		}
		return wps;
	}

	$.unregist = function(wrapper, interface) {
		this.__wrapper[interface];
	}
})();

