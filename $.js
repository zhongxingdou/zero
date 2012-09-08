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
			setDefault: "function(ainterface, name)",

			/**
			 * 查找除exceptName外的对象的所有wrapper
			 * @param {Object} o
			 * @param {String} exceptName
			 */
			findWrapperNamesExcept: "function(o, exceptName)",

			/**
			 * 根据interface获取exceptName外的所有wrapper
			 * @param {Interface} ainterface
			 * @param {String} exceptName
			 */
			getWrapperNamesExcept: "function(ainterface, exceptName)"
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

		//复制所有成员方法到代理对象上
		z._everyKey(o, function(key, value) {
			if(typeof value == "function"){
				proxy[key] = value.bind(proxy.target);
			}
		});

		//module中this.x＝xx不会设置到target上，要设置到target请使用this.set(x, xx);
		$.findWrapper(o, name).forEach(function(wrapper){
			$include(wrapper, proxy);
		}); 

		if(!name){
			$.findWrapperNamesExcept(o, name).forEach(function(wrapperName){
				//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
				if(!proxy[wrapperName]){
					proxy[wrapperName] = function(){
						$(proxy, wrapperName);
						return proxy;
					}
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
			z._traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapperNamesExcept(clazz, exceptName);
				z._uniqPush(ws, w);

				var interfaces = proto.__implementations__;
				if(interfaces){
					interfaces = interfaces.slice[0];
					interfaces.each(function(ainterface){
						w = $.getWrapperNamesExcept(ainterface, exceptName)
						z._uniqPush(ws, w);
					});
				}
			});
		}
		return ws.reverse();
	}


	function $$(o /* ,name */){
		if(o == null)return;

		var type = typeof o;

		if(type != "object" && type != "function"){
			var clazz = eval(type.charAt(0).toUpperCase() + type.slice(1));
			o = new clazz(o);
		}

		//备份扩展过程中要覆盖的成员
		var overwrites = ["__origin__", "target"];
		var defined__origin__ = o.__origin__ != null;
		o.__origin__ = defined__origin__ ? {__origin__: o.__origin__} : {};

		if(o.target)o.__origin__.target = o.target;
		o.target = o;

		var name = arguments[1];
		$.findWrapper(o, name).forEach(function(wrapper){
			$include(wrapper, o);
		});

		var __origin__ = o.__origin__;
		//删除覆盖的
		for(var i=0, l=overwrites.length; i<l; i++){
			delete o[overwrites[i]];
		}
		//恢复原有的
		for(var k in __origin__){
			o[k] = __origin__[k];
		}

		if(!name){
			$.findWrapperNamesExcept(o, name).forEach(function(wrapperName){
				//不要覆盖对象的原有成员，要wrap还可以通过o.wrap(wrapperName)来实现
				if(!o[wrapperName]){
					o[wrapperName] = function(){
						$$(o, wrapperName);
						return o;
					}
				}
			});
		}

		if(o.target){
			o.__origin__ = {target: o.target};
		}
		o.target = o;
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
			z._traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz, name);
				w && z._uniqPush(ws, w);

				var interfaces = proto.__implementations__;
				if(interfaces){
					interfaces = interfaces.slice[0];
					interfaces.each(function(ainterface){
						w= $.getWrapper(ainterface, name)
						w && z._uniqPush(ws, w);
					});
				}
			});
		}

		return ws.reverse();
	}

	$implement(I$, $);
	$implement(I$$, $$);

	$global("$", $);
	$global("$$", $$);
});
