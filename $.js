$run(function(){
	eval($global.all);

	/**
	 * 将源对象包装成增强的对象，并且不污染源对象
	 * @param {Object} o
	 * @param {String} [name] 指定一个包装器
	 */
	var I$ = {
		type: "function(o)",
		member: {
			/**
			 * 注册一个wrapper
			 * @param {Module} wrapper
			 * @param {Interface} interface
			 * @param {String} name
			 */
			regist: "function(wrapper, interface, name)",

			/**
			 * 反注册一个wrapper
			 * @param {Interface} interface
			 * @param {String} name
			 */
			unregist: "function(interface, name)",

			/**
			 * 根据interface获取一个wrapper
			 * @param {Interface} interface
			 * @param {String} name
			 */
			getWrapper: "function(interface, name)",

			/**
			 * 查找对象的wrapper
			 * @param {Object} o
			 * @param {String} name
			 */
			findWrapper: "function(o, name)",

			/**
			 * 设置某个接口的默认wrapper
			 * @param {Interface} interface
			 * @param {String} name
			 */
			setDefault: "function(interface, name)"
		}
	};

	/**
	 * 将源对象包装成增强的对象
	 * @param {Object} o
	 * @param {String} [name] 指定一个包装器
	 */
	var I$$ = {
		type: "function(o)"
	}

	function $(o /*, name */) {
		var name = arguments[1];
		var proxy = {target: o};

		//copy function member
		$everyKey(o, function(key, value) {
			if(typeof value == "function"){
				proxy[key] = value.bind(proxy.target);
			}
		});

		//include wrapper
		//module中this.x＝xx不会设置到target上，要设置到target请使用this.set(x, xx);
		//!!! @todo 考虑要不要给Module.onIncluded方法传递$(target),考虑include到对象时是否绑定到$(target),避免直接操作target对象
		$.findWrapper(o, name).reverse().forEach(function(wrapper){
			$include(wrapper, proxy);
		}); 

		return proxy;
	}


	function $$(o /* ,name */){
		var name = arguments[1];
		$.findWrapper(o, name).reverse().forEach(function(wrapper){
			$include(wrapper, o);
		});
		return o;
	}

	var DEFAULT = "@default";

	$.__wrapper = {};

	$.regist = function(wrapper, interface, name) {
		if(name  === DEFAULT)return;

		if(interface instanceof Array){
			interface.forEach(function(face){
				$.regist(wrapper, face, name);
			});
		}else{
			var map = this.__wrapper[interface];
			if(!map){
				map = this.__wrapper[interface] = {"@default": null};
			}

			this.__wrapper[interface][name] = wrapper;
		}
	}

	$.setDefault = function(interface, name){
		var wp = this.getWrapper(interface, name);
		if(wp){
			this.__wrapper[interface][DEFAULT] = wp;
		}
	}

	$.unregist = function(interface, name) {
		if(!(interface && name))return;

		if(interface instanceof Array){
			interface.forEach(function(face){
				$.unregist(face, name);
			});
		}else{
			if(this.__wrapper[interface][DEFAULT] ==  this.getWrapper(interface, name)){
				this.setDefault(interface, null);
			}
			delete this.__wrapper[interface][name];
		}
	}

	$.getWrapper = function(interface, name) {
		name = name || DEFAULT;
		var map = this.__wrapper[interface];
		if(map){
			return map[name];
		}
	}

	$.findWrapper = function(o, name) {
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			$traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz, name);
				w && ws.push(w);

				if(clazz.implns){
					clazz.implns.each(function(interface){
						w= $.getWrapper(interface, name)
						w && ws.push(w);
					});
				}
			});
		}else{
			ws.push($.getWrapper(type, name));
		}

		return ws;
	}

	$global("$", $);
	$global("$$", $$);
});
