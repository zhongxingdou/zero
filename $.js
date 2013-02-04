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
			 * @param {Interface} protocol
			 * @param {String} name
			 */
			regist: "function(wrapper, protocol, name)",

			/**
			 * 反注册一个wrapper
			 * @param {Interface} protocol
			 * @param {String} name
			 */
			unregist: "function(protocol, name)",

			/**
			 * 根据protocol获取一个wrapper
			 * @param {Interface} protocol
			 * @param {String} name
			 */
			getWrapper: "function(protocol, name)",

			/**
			 * 查找对象的wrapper
			 * @param {Object} o
			 * @param {String} name
			 */
			findWrapper: "function(o, name)",

			/**
			 * 设置某个接口的默认wrapper
			 * @param {Interface} protocol
			 * @param {String} name
			 */
			setDefault: "function(protocol, name)",

			/**
			 * 查找除exceptName外的对象的所有wrapper
			 * @param {Object} o
			 * @param {String} exceptName
			 */
			findWrapperNamesExcept: "function(o, exceptName)",

			/**
			 * 根据protocol获取exceptName外的所有wrapper
			 * @param {Interface} protocol
			 * @param {String} exceptName
			 */
			getWrapperNamesExcept: "function(protocol, exceptName)"
		}
	};

	/**
	 * 将源对象包装成增强的对象
	 * @param {Object} o
	 * @param {String} [name] 指定一个包装器
	 */
	var I$$ = {
		type: "function(o)"
	};

	function $(o /*, name, isProxy*/) {
		if(o == null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

		var name = arguments[1];
		var isProxy = arguments[2] === true;
		var proxy = isProxy ? o : {target: o};

		//复制所有成员方法到代理对象上
		if(!isProxy){
			//复制原型上的方法到代理对象上，但并不能复制不能枚举的原型方法
			/*
			var firstProto = true;
			z._traceProto(o, function(proto){
				z._everyKey(proto, function(k, v){
					if(typeof v == "function"){
						if(proxy[k]){
							if(firstProto){//overwrite
								proxy[k] = v.bind(proxy.target);
							}
						}else{
							proxy[k] = v.bind(proxy.target);
						}
					}
				});
				if(firstProto)firstProto = false;
			});
			*/

			z._everyKey(o, function(key, value) {
				if(typeof value == "function"){
					proxy[key] = value.bind(proxy.target);
				}
			});
		}

		//module中this.x＝xx不会设置到target上，要设置到target请使用this.set(x, xx);
		$.findWrapper(o, name).forEach(function(wrapper){
			$include(wrapper, proxy);
		});

		if(!name){
			$.findWrapperNamesExcept(o, name).forEach(function(wrapperName){
				//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
				if(!proxy[wrapperName]){
					proxy[wrapperName] = function(){
						$(proxy, wrapperName, true);
						return proxy;
					};
				}
			});
		}

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

	$.getWrapperNamesExcept = function(protocol, exceptName){
		exceptName = exceptName || DEFAULT;
		var map = this.__wrapper[protocol];
		var ws = [];
		if(map){
			ws = _keysExcept(map, exceptName);
		}
		return ws;
	};

	$.findWrapperNamesExcept = function(o, exceptName){
		exceptName = exceptName || DEFAULT;
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			z._traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapperNamesExcept(clazz, exceptName);
				z._uniqPush(ws, w);

				var protocols = proto.__implns__;
				if(protocols){
					protocols = protocols.slice(0);
					protocols.forEach(function(protocol){
						w = $.getWrapperNamesExcept(protocol, exceptName);
						z._uniqPush(ws, w);
					});
				}
			});
		}
		return ws.reverse();
	};


	function $$(o /* ,name */){
		if(o == null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

		//备份扩展过程中要覆盖的成员
		if(o.target)o.originTarget = o.target; 

		o.target = o;

		var name = arguments[1];
		$.findWrapper(o, name).forEach(function(wrapper){
			$include(wrapper, o);
		});


		if(!name){
			$.findWrapperNamesExcept(o, name).forEach(function(wrapperName){
				//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
				if(!o[wrapperName]){
					o[wrapperName] = function(){
						$$(o, wrapperName);
						return o;
					};
				}
			});
		}

		return o;
	}

	var DEFAULT = "default";

	$.__wrapper = {};

	$.regist = function(wrapper, protocol, name) {
		name = name || DEFAULT;

		if(protocol instanceof Array){
			protocol.forEach(function(face){
				$.regist(wrapper, face, name);
			});
		}else{
			var map = this.__wrapper[protocol];
			if(!map){
				map = this.__wrapper[protocol] = {"default": null};
			}

			if(this.__wrapper[protocol][name]){
				throw "name '" + name + "' has been registed.";
			}
			this.__wrapper[protocol][name] = wrapper;
		}
	};

	$.setDefault = function(protocol, name){
		var wp = this.getWrapper(protocol, name);
		if(wp){
			this.__wrapper[protocol][DEFAULT] = wp;
		}
	};

	$.unregist = function(protocol, name) {
		if(!(protocol && name))return;

		if(protocol instanceof Array){
			protocol.forEach(function(face){
				$.unregist(face, name);
			});
		}else{
			if(this.__wrapper[protocol][DEFAULT] ==  this.getWrapper(protocol, name)){
				this.setDefault(protocol, null);
			}
			delete this.__wrapper[protocol][name];
		}
	};

	$.getWrapper = function(protocol, name) {
		name = name || DEFAULT;
		var map = this.__wrapper[protocol];
		if(map){
			return map[name];
		}
	};

	$.findWrapper = function(o, name) {
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			z._traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz, name);
				w && z._uniqPush(ws, w);

				var protocols = proto.__implns__;
				if(protocols){
					protocols = protocols.slice(0);
					protocols.forEach(function(protocol){
						w= $.getWrapper(protocol, name);
						w && z._uniqPush(ws, w);
					});
				}
			});
		}

		return ws.reverse();
	};

	$.wrap = function(o, action, name){
		var name = name || action.name;
		if(!name)return;

		var wrapper = $.getWrapper(o, DEFAULT);
		if(!wrapper){
			var m = {};
			m[name] = action;
			$.regist($module(m), o);
		}else{
			wrapper[name] = action;
		}
	};

	$.unwrap = function(o, name){
		var wrapper = $.getWrapper(o, DEFAULT);
		if(wrapper){
			delete wrapper[name];
		}
	};

	$.sandbox = function(o, action, name){
		name = name || action.name;
		var sandbox = function(fn){
			if(!fn)return;
			$.wrap(o, action, name);
			var result = fn();
			$.unwrap(o, name);
			return result;
		};
		return sandbox;
	};

	$implement(I$, $);
	$implement(I$$, $$);

	$global("$", $);
	$global("$$", $$);
});
