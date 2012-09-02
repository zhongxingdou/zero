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
			 * @param {Interface} ainterface
			 * @param {String} name
			 */
			regist: "function(wrapper, ainterface, name)",

			/**
			 * 反注册一个wrapper
			 * @param {Interface} ainterface
			 * @param {String} name
			 */
			unregist: "function(ainterface, name)",

			/**
			 * 根据interface获取一个wrapper
			 * @param {Interface} ainterface
			 * @param {String} name
			 */
			getWrapper: "function(ainterface, name)",

			/**
			 * 查找对象的wrapper
			 * @param {Object} o
			 * @param {String} name
			 */
			findWrapper: "function(o, name)",

			/**
			 * 设置某个接口的默认wrapper
			 * @param {Interface} ainterface
			 * @param {String} name
			 */
			setDefault: "function(ainterface, name)"
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
		if(o == null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

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

		!name && $.findWrapperNamesExcept(o, name).reverse().forEach(function(wrapperName){
			//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
			if(!proxy[wrapperName]){
				proxy[wrapperName] = function(){
					$(proxy, wrapperName);
					return proxy;
				}
			}
		});

		return proxy;
	}

	function _keysExcept(obj, except){
		var ar = [];
		for(var k in obj){
			var m = obj[k];
			if(except !== k){
				ar.push(k);
			}
		}
		return ar;
	}

	$.getWrapperNamesExcept = function(ainterface, exceptName){
		exceptName = exceptName || DEFAULT;
		var map = this.__wrapper[ainterface];
		var ws = [];
		if(map){
			ws = _keysExcept(map, exceptName);
		}
		return ws;
	}

	$.findWrapperNamesExcept = function(o, exceptName){
		exceptName = exceptName || DEFAULT;
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			$traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapperNamesExcept(clazz, exceptName);
				ws = ws.concat(w);

				if(clazz.__implementations__){
					clazz.__implementations__.each(function(ainterface){
						w= $.getWrapperNamesExcept(ainterface, exceptName)
						ws = ws.concat(w);
					});
				}
			});
		}

		return ws;
	}


	function $$(o /* ,name */){
		if(o == null)return;

		var type = typeof o;
		if(type != "object" && type != "function"){
			o = new o.constructor(o);
		}

		o.target = o;

		var name = arguments[1];
		$.findWrapper(o, name).reverse().forEach(function(wrapper){
			$include(wrapper, o);
		});

		!name && $.findWrapperNamesExcept(o, name).reverse().forEach(function(wrapperName){
			//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
			if(!o[wrapperName]){
				o[wrapperName] = function(){
					$$(o, wrapperName);
					return o;
				}
			}
		});

		return o;
	}

	var DEFAULT = "default";

	$.__wrapper = {};

	$.regist = function(wrapper, ainterface, name) {
		name = name || DEFAULT;

		if(ainterface instanceof Array){
			ainterface.forEach(function(face){
				$.regist(wrapper, face, name);
			});
		}else{
			var map = this.__wrapper[ainterface];
			if(!map){
				map = this.__wrapper[ainterface] = {"default": null};
			}

			if(this.__wrapper[ainterface][name]){
				throw "name '" + name + "' has been registed.";
			}
			this.__wrapper[ainterface][name] = wrapper;
		}
	}

	$.setDefault = function(ainterface, name){
		var wp = this.getWrapper(ainterface, name);
		if(wp){
			this.__wrapper[ainterface][DEFAULT] = wp;
		}
	}

	$.unregist = function(ainterface, name) {
		if(!(ainterface && name))return;

		if(ainterface instanceof Array){
			ainterface.forEach(function(face){
				$.unregist(face, name);
			});
		}else{
			if(this.__wrapper[ainterface][DEFAULT] ==  this.getWrapper(ainterface, name)){
				this.setDefault(ainterface, null);
			}
			delete this.__wrapper[ainterface][name];
		}
	}

	$.getWrapper = function(ainterface, name) {
		name = name || DEFAULT;
		var map = this.__wrapper[ainterface];
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

				if(clazz.__implementations__){
					clazz.__implementations__.each(function(ainterface){
						w= $.getWrapper(ainterface, name)
						w && ws.push(w);
					});
				}
			});
		}

		return ws;
	}

	$implement($, I$);
	$implement($$, I$$);

	$global("$", $);
	$global("$$", $$);
});
