$run(function(){
	eval($global.all);


	/**
	 * 根据对象的类，原型以及实现的协议，使用对象相应的扩展模块包装对象的代理
	 * @param {Object} o
	 * @param {String} [name] 指定一个包装器
	 */
	function $(o /*, name*/) {
		if(o === null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

		var name = arguments[1];
		var isProxy = o instanceof $.Proxy;
		var proxy = isProxy ? o : new $.Proxy(o);

		//复制所有成员方法到代理对象上
		if(!isProxy){
			//复制原型上的方法到代理对象上，但并不能复制不能枚举的原型方法

			z._everyKey(o, function(key, value) {
				if(typeof value == "function"){
					proxy[key] = value.bind(proxy.target);
				}
			});
		}

		//module中this.x＝xx不会设置到target上，要设置到target请使用this.set(x, xx);
		$.findWrapper(proxy.target, name).forEach(function(wrapper){
			$include(wrapper, proxy);
		});

		return proxy;
	}

	$.Proxy = function(target){ this.target = target; };

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

	/**
	 * 根据protocol获取exceptName外的所有wrapper
	 * @param {Interface} protocol
	 * @param {String} exceptName
	 */
	$.getWrapperNamesExcept = function(protocol, exceptName){
		exceptName = exceptName || DEFAULT;
		var map = this.__wrapper[protocol];
		var ws = [];
		if(map){
			ws = _keysExcept(map, exceptName);
		}
		return ws;
	};

	/**
	 * 根据对象的类，原型以及实现的协议，使用对象相应的扩展模块包装对象
	 * @param {Object} o
	 * @param {String} [name] 指定一个包装器
	 */
	function $$(o /* ,name */){
		if(o === null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

		//备份扩展过程中要覆盖的成员
		var isProxy = o instanceof $.Proxy;
		if(!isProxy){
			if(o.target)o.originTarget = o.target;
			o.target = o;
		}

		var name = arguments[1];
		//当o是$.Proxy实例时，应该根据o.target即真实对象来查询扩展器
		$.findWrapper(o.target, name).forEach(function(wrapper){
			$include(wrapper, o);
		});

		return o;
	}

	var DEFAULT = "default";

	$.__wrapper = {};

	/**
	 * 注册一个wrapper
	 * @param {Module} wrapper
	 * @param {Interface} protocol
	 * @param {String} name
	 */
	$.regWrapper = function(wrapper, protocol, name) {
		name = name || DEFAULT;

		if(protocol instanceof Array){
			protocol.forEach(function(face){
				$.regWrapper(wrapper, face, name);
			});
		}else{
			var map = this.__wrapper[protocol];
			if(!map){
				map = this.__wrapper[protocol] = {"default": null};
			}

			if(this.__wrapper[protocol][name]){
				throw "name '" + name + "' has been registered.";
			}
			this.__wrapper[protocol][name] = wrapper;
		}
	};

	/**
	 * 设置某个接口的默认wrapper
	 * @param {Interface} protocol
	 * @param {String} name
	 */
	$.setDefault = function(protocol, name){
		var wp = this.getWrapper(protocol, name);
		if(wp){
			this.__wrapper[protocol][DEFAULT] = wp;
		}
	};

	/**
	 * 反注册一个wrapper
	 * @param {Interface} protocol
	 * @param {String} name
	 */
	$.removeWrapper = function(protocol, name) {
		if(!(protocol && name))return;

		if(protocol instanceof Array){
			protocol.forEach(function(face){
				$.removeWrapper(face, name);
			});
		}else{
			if(this.__wrapper[protocol][DEFAULT] ==  this.getWrapper(protocol, name)){
				this.setDefault(protocol, null);
			}
			delete this.__wrapper[protocol][name];
		}
	};

	/**
	 * 根据protocol获取一个wrapper
	 * @param {Interface} protocol
	 * @param {String} name
	 */
	$.getWrapper = function(protocol, name) {
		name = name || DEFAULT;
		var map = this.__wrapper[protocol];
		if(map){
			return map[name];
		}
	};

	/**
	 * 查找对象的wrapper
	 * @param {Object} o
	 * @param {String} name
	 */
	$.findWrapper = function(o, name) {
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			z._traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz, name);
				if(w)z._uniqPush(ws, w);

				var protocols = proto.__implns__;
				if(protocols){
					protocols = protocols.slice(0);
					protocols.forEach(function(protocol){
						w = $.getWrapper(protocol, name);
						if(w)z._uniqPush(ws, w);
					});
				}
			});
		}

		return ws.reverse();
	};

	/**
	 * 注册扩展器的一种DSL
	 * @param  {Protocol|Class|Prototype} o 要扩展的目标
	 * @return {Object}
	 * @example
	 * $.make(String).can({"capitalize": function(){
	 *     var o = this.target.valueOf();
	 *     return o.charAt(0).toUpperCase() + o.slice(1);
	 * }
	 */
	$.make = function(o){
		return {
			can: function(name, fn){
				if(typeof name == "string"){
					_wrapWith(o, fn, name);
				}else if(typeof name == "object"){
					for(var action in name){
						_wrapWith(o, name[action], action);
					}
				}
				return this;
			},
			lose: function(name){
				if(typeof name == "string"){
					_unWrap(o, name);
				}else if(typeof name == "object"){
					for(var action in name){
						_unWrap(o, action);
					}
				}
				return this;
			}
		};
	};

	var  _wrapWith = function(o, action, name){
		name = name || action.name;
		if(!name)return;

		var wrapper = $.getWrapper(o, DEFAULT);
		if(!wrapper){
			var m = {};
			m[name] = action;
			$.regWrapper(m, o);
		}else{
			wrapper[name] = action;
		}
	};

	var _unWrap = function(o, name){
		var wrapper = $.getWrapper(o, DEFAULT);
		if(wrapper){
			delete wrapper[name];
		}
	};

	/**
	 * 创建一个扩展模块的沙箱
	 * @param  {Protocol|Class|Prototype} o       扩展目标
	 * @param  {Module} wrapper 扩展模块
	 * @return {Function}         沙箱
	 */
	$.createSandbox = function(o, wrapper){
		var sandbox = function(fn){
			if(!fn)return;
			$.make(o).can(wrapper);
			var result;
			try{
				result = fn();
			}finally{
				$.make(o).lose(wrapper);
			}
			return result;
		};
		return sandbox;
	};

	/**
	 * 创建一个沙箱并立即在沙箱中运行方法
	 * @param  {Protocol|Class|Prototype}   o       扩展目标
	 * @param  {Module}   wrapper 扩展模块
	 * @param  {Function} fn      要运行的方法
	 * @return {Object}           fn的返回结果
	 */
	$.onceWrap = function(o, wrapper, fn){
		var box = $.makeSandbox(o, wrapper);
		return box(fn);
	};

	$global("$", $);
	$global("$$", $$);
});
