/**
* @global
*/
// var z = {};
(function(host) {
	var IVariableMenager = {
		type: "function(names, o)",
		member: {
			//注册一个变量
			set: "function(name, o)",

			//返回一个变量
			get: "function(name):Object",

			//列举所有的全局变量
			list: "function():Array",

			//导出指定变量到某个对象上
			exportTo: "function(list, target)",
			
			//提供一个沙箱运行环境，确保所执行的代码引用到的是被管理的变量
			run: "function(fn)",

			//删除一个变量
			destroy: "function(name)",

			//一个用于eval(string)方式声明被管理变量的表达式字符串
			all: "string"
		}
	};



	/**
	 * 变量管理类
	 * @constructor
	 * @mixin
	 */
	function VariableManager() {
		this.__member = {};
	}

	VariableManager.prototype = {
		/**
		 * 登记一个变量
		 * @param {String} name 注册名
		 * @param {Object} object 变量
		 */
		set: function(name, object) {
			if (this.get(name)) {
				this.destroy(name);
			}
			this.__member[name] = object;

			this.__onChange();

			return this;
		},

		/**
		 * 注册或者删除一个变量时执行的方法
		 */
		__onChange: function(){
			this.all = this.__getEvalCode();
		},

		/**
		 * 根据名称返回变量
		 * @param {String} name 注册名
		 */
		get: function(name) {
			return this.__member[name];
		},

		/**
		 * 返回所有注册的变量
		 * @return Array
		 */
		list: function() {
			var a = [];
			for (var p in this.__member) {
				a.push(p);
			}
			return a;
		},

		/**
		 * 删除一个变量
		 * @param {String} name 注册名
		 */
		destroy: function(name) {
			if(name in this.__member){
				delete this.__member[name];
				this.__onChange();
			}
		},

		/**
		 * 导出变量到指定对象上
		 * @param {Array|String} list 要导出的变量名称列表
		 * @param {Object} target 导出目标对象
		 *
		 * @example
		 * exportTo(["$interface", "$module"], window);
		 */
		exportTo: function(list, target) {
			if(typeof list == "string"){
				list = [list];
			}

			var ms = list || this.list(),
				k,
				self = this;

			ms.forEach(function(k){
				target[k] = self.get(k);
			});
		},

		/**
		 * 运行指定的方法，并按方法的参数名提取管理的变量作为参数
		 * @param {Function} fn(param1, param2)
		 * !!!注意fn内部不能引用外部局部变量，只能引用全局的
		 *
		 * @example
		 *	var man = new VariableManager();
		 *
		 *	man.set("param1", value1);
		 *	man.set("param2", value2);
		 *
		 *	man.run(function(param1, param2){});
		 */
		run: function(fn) {
			var aNameList = fn.__args;
			if (!aNameList) {
				var ms = fn.toString().match(/\((.*)?\)/);
				if (ms && ms[1]) {
					aNameList = ms[1].replace(/ /g, '').split(",");
				} else {
					aNameList = [];
				}
				fn.__args = aNameList; //cache args
			}

			if (aNameList.length === 0) {
				aNameList = this.list();
				var code = fn.toString();
				var body = code.substr(code.indexOf("{"));

				//fn = eval("(function(" + aNameList.join(",") + ")" + body + ")"); //throw error in ie
				fn = eval("(function(){ return function(" + aNameList.join(",") + ")" + body + "})()"); //throw error in ie
			}

			var oList = [];
			for (var i = 0, l = aNameList.length; i < l; i++) {
				oList.push(this.get(aNameList[i]));
			}

			var thisObj = {};
			fn.apply(thisObj, oList);
			return this;
		},
		
		__getEvalCode: function(){
			var list = this.list();
			var code = [];
			list.forEach(function(name){
				code.push(name + "=" + "$global.get('" + name + "')");
			});
			return "var " + code.join(",") + ";";
		}
	}


	/**
	 * 注册一个变量，$global.set的快捷方式
	 * @global
	 * @mixes VariableManager
	 */
	function $global(name, o) {
		var self = arguments.callee;
		var type = typeof name;
		if(type == "object"){
			for(var k in name){
				self.set(k, name[k]);
			}
		}else if(type == "string"){
			self.set(name, o);
		}
		return self;
	}

	var hostMan = new VariableManager();
	var p;
	for(p in hostMan){
		$global[p] = hostMan[p];
	}
	
	var z = {};

	z.VariableManager = VariableManager;

	$global("z", z);

	host.$global = $global;

    host.$run = function(fn) {
        var thisObj = {};
        fn.apply(thisObj, arguments);
        return thisObj;
    };
})(this);
$run(function(){
    eval($global.all);

    function _isPlainObject(o) {
		if(typeof o != "object")return false;

		if(!(o instanceof Object))return false;

		if(!Object.prototype.isPrototypeOf(o))return false;

		var i=0;
		_traceProto(o, function(proto){
			if(++i > 1)return false;
		});

		if(i>1)return false;

		return true;
    }

    /**
     * 包含一个module到对象
     * @param {IModule} module 
     * @param {Object} toObj 
     */
    function $include(module, toObj, exclude) {
        var exclude = exclude || [];
        exclude = exclude.concat("onIncluded", "__implns__");

        z._everyKey(module, function(k, v) {
            if (exclude.indexOf(k) == -1) {
                toObj[k] = v;
            }
        });

        if (module.onIncluded) {
            module.onIncluded.call(toObj);
        }
    }

    /*
     * 原型继承
     * @param {Class} clazz
     * @param {Object} base
     */
    function $extend(clazz, base) {
        var old = clazz.prototype;

        var fn = function() {};
        fn.prototype = base.prototype;
        clazz.prototype = new fn();

        var proto = clazz.prototype;
        if (old) {
            z._copy(old, proto);
        }

        proto.constructor = clazz;
        clazz.baseProto = base.prototype;
    }


    /**
     * 声明对象实现了某接口，并将接口存入__implns__中
     */
    function $implement(ainterface, o) {
        var implns = o.__implns__;
        if (!implns) {
            o.__implns__ = ainterface instanceof Array ? ainterface.slice(0) : [ainterface];
        } else {
            z._uniqPush(implns, ainterface);
        }
        return o;
    }
    /**
     * 将一个或一组对象压入目标数组，并且确保目标数组中不包含压入对象
     * @param {Array} ar 要压入对象的数组
     * @param {Object|Array} o 要压入的对象
     */
    function _uniqPush(ar, o) {
        if (o instanceof Array) {
            for (var i = 0, l = o.length; i < l; i++) {
                _uniqPush(ar, o[i]);
            }
            return;
        }

        if (ar.indexOf) {
            if (ar.indexOf(o) == -1) {
                ar.push(o);
            }
        } else {
            var l = ar.length;
            while (l--) {
                if (ar[l] == o) return;
            }
            ar.push(o);
        }
    }

    /**
     * 遍历数组或集合对象，处理函数返回false将中断遍历
     * @param {Array|Object} items 集合对象
     * @param {Function} fn(item) 处理函数
     * @param {Object} thisp 让处理函数执行时this指向它
     * @return Boolean
     */
    function _every(items, fn, thisp) {
        if (!items) return true;
        for (var i = 0, l = items.length; i < l; i++) {
            if (fn.apply(thisp, [items[i]]) === false) return false;
        }
        return true;
    }


    /**
     * 遍历对象的可遍历成员 
     * @param {Object} o 对象
     * @param {Function} fn(key, value) 处理函数
     * @param {Object} thisp 让处理函数执行时this指向它
     * @return Boolean
     */
    function _everyKey(o, fn, thisp) {
        if (typeof fn != "function") return false;

        for (p in o) {
            if (fn.apply(thisp, [p, o[p]]) === false) return false;
        }

        return true;
    }

    /**
     * 根据指定属性来追溯
     * @param {Object} o 对象
     * @param {String} prop 属性名
     * @param {Function} fn(a) 处理函数(追溯到的对象)
     * @param {Object} thisp 让处理函数执行时this指向它
     * @return Boolean
     */
    function _trace(o, prop, fn, thisp) {
        var a = o;
        while (a) {
            if (fn.apply(thisp, [a]) === false) return false;
            a = a[prop];
        }
        return true;
    }

    var SUPPORTED_PROTO = {}.__proto__ !== undefined;

    /**
     * 遍历对象的原型链，从下向上
     * @param {Object} o 对象
     * @param {Function} fn(proto) 处理函数(对象原型)
     * @param {Object} thisp 让处理函数执行时this指向它
     */
    if (SUPPORTED_PROTO) {
        function _traceProto(o, fn, thisp) {
            return _trace(o.__proto__, '__proto__', fn, thisp);
        }
    } else {
        function _traceProto(o, fn, thisp) {
            var proto = o.constructor.prototype;
            if (proto == o) {
                proto = o.constructor.baseProto;
            }

            while (proto) {
                if (fn.apply(thisp, [proto]) === false) return false;
                proto = proto.constructor.baseProto;
            }

            if (o.constructor !== Object) {
                if (fn.apply(thisp, [Object.prototype]) === false) return false;
            }
        }
    }

    /**
     * 分割集合对象
     * @param {Object} items 集合对象
     * @param {Object} start=0 从第几项开始转换 
     * @return Array
     */
    function _slice(items, start) {
        return Array.prototype.slice.call(items, start || 0);
    }

    /**
     * 将集合对象转换成数组
     * @param {Object} items 集合对象
     * @return Array
     */
    function _array(items) {
        return Array.prototype.slice.call(items, 0);
    }


    /**
     * 复制对象成员到另一个对象
     * @param {Object} from
     * @param {Object} to
     */
    function _copy(from, to) {
        var p;

        for (p in from) {
            to[p] = from[p];
        }

        return to;
    }

    /**
     * 复制对象成员到另一个对象，但对方已有同名成员时不覆盖
     * @param {Object} from
     * @param {Object} to
     */
    function _merge(from, to) {
        var p;

        for (p in from) {
            if (!(p in to)) {
                to[p] = from[p];
            }
        }

        return to;
    }


    /**
     * 获取对象可枚举的所有成员名
     * @param {Object} o
     * @return Array
     */
    function _keys(o) {
        var p, keys = [];
        for (p in o) {
            keys.push(p);
        }
        return keys;
    }


    function _makeSetter(name) {
        return Function( name + "=arguments[0]");
    }

    function _makeGetter(name) {
        return Function("return " + name);
    }

    /**
     * Object.definedProperties的快捷方式
     */
    function $property() {
        var args = arguments;
        var l = args.length;
        var obj = args[0];
        var t = typeof args[1];
        if (t == "string") {
            var name = args[1];
            var config = args[2] || {};
            if(!config.hasOwnProperty("writable") && !config.set && !config.get){
                config.writable = true;
            }
            Object.defineProperty(obj, name, config);
        } else if (t == "object") {
            z._everyKey(args[1], function(name, config) {
                $property(obj, name, config);
            });
        }
    }

    /**
     * 用于方法在自己内部调用thisp原型链上的同名方法
     * @param {Object} o
     * @param {Array} args 参数
     */
    function $callbase(obj, args) {
        var caller = $callbase.caller;
        //此处不能用caller.name，因为caller.name可能不是它在对象中的key
        var fnName = (caller == obj.constructor) ? "constructor" : undefined;
        if (!fnName) {
            z._everyKey(obj, function(k) {
                if (obj[k] == caller) {
                    fnName = k;
                }
            }, obj);
        }


        var protoFn = null;
        _traceProto(obj.__proto__ || obj.constructor.prototype, function(proto) {
            var o = proto[fnName];
            if (o) {
                protoFn = o;
                return false; //break;
            }
        });

        if (typeof protoFn == "function") {
            return protoFn.apply(obj, args || caller.arguments);
        }
    }


    /**
     * 声明一个枚举
     * @param {Object} o
     *
     * @example
     * var color = $enum("BLUE", "RED", "YELLOW");
     * color.BLUE
     * color.RED
     * color.YELLOW
     *
     * var color = $enum{{
     *	"BLUE": -1,
     *	"RED": 1
     * })
     */
    function $enum(obj) {
        if (arguments.length == 1 && typeof obj == "object") {
            return obj;
        }

        var o = {};
        z._every(arguments, function(k) {
            o[k] = {};
        });
        return o;
    }

    /***
     * 运行一个方法，避免产生全局变量
     * @param {Function} fn 要运行的方法
     */
    function $run(fn) {
        var thisObj = {};
        fn.apply(thisObj, arguments);
        return thisObj;
    }


    /**
     * 判断一个成员的名字是否符合表示私有
     * @param {String} name
     * @return Boolean
     */
    function _isPrivate(name) {
        return name.toString().match(/^_/);
    }

    /**
     * 在方法内部调用，返回方法自身，避免使用方法名来引用自身
     */
    function $fnself() {
        return $fnself.caller;
    }

    /**
     * 把option添加到指定的fn上
     * @param {Function} fn 
     * @param {Object} option
     */
    function $fn(fn, option) {
        if (option) {
            fn.option = option;
        }
        return fn;
    }

    /**
     * 判断一个集合是否包含另一个子集
     * @param {Object} set 主集合
     * @param {Object} sub 子集合
     */
    function _containsAll(set, sub) {
        var k, count = 0;

        for (var i = 0, l = sub.length; i < l; i++) {
            if (set.indexOf(sub[i]) != -1) { //exists
                count++;
            } else {
                return false;
            }
        }

        return count > 0;
    }

    // $global("$run", $run);
    // HOST.$run = $run;


    z._every = _every;
    z._everyKey = _everyKey;

    z._trace = _trace;
    z._traceProto = _traceProto;

    z._uniqPush = _uniqPush;
    z._slice = _slice;
    z._copy = _copy;
    z._merge = _merge;

    z._keys = _keys;
    z._containsAll = _containsAll;
    z._isPrivate = _isPrivate;
    z._array = _array;
	z._isPlainObject = _isPlainObject;

    var vars = [];
    vars.push("$implement", "$extend", "$callbase", "$include");
    vars.push("$enum", "$property", "$fn");
    vars.push("$fnself");

    var name;
    while (name = vars.pop()) {
        $global(name, eval(name));
    }
});
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

	$.getWrapperNamesExcept = function(ainterface, exceptName){
		exceptName = exceptName || DEFAULT;
		var map = this.__wrapper[ainterface];
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

				var interfaces = proto.__implns__;
				if(interfaces){
					interfaces = interfaces.slice(0);
					interfaces.forEach(function(ainterface){
						w = $.getWrapperNamesExcept(ainterface, exceptName);
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
	};

	$.setDefault = function(ainterface, name){
		var wp = this.getWrapper(ainterface, name);
		if(wp){
			this.__wrapper[ainterface][DEFAULT] = wp;
		}
	};

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
	};

	$.getWrapper = function(ainterface, name) {
		name = name || DEFAULT;
		var map = this.__wrapper[ainterface];
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

				var interfaces = proto.__implns__;
				if(interfaces){
					interfaces = interfaces.slice(0);
					interfaces.forEach(function(ainterface){
						w= $.getWrapper(ainterface, name);
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
$run(function(){
	eval($global.all);

	/**
	* IObject
	* @interface
	*/
	var IObject = {
		__implns__: Array
	}

	/**
	 * IModule
	 * @interface
	 */
	var IModule = {
		onIncluded: "[function()]"
	}


	z.IObject = IObject;

	z.IModule = IModule;

	function $module(m){
		$implement(IModule,m);
		return m;
	}

	$global("$module", $module);
});

$run(function() {
	eval($global.all);

	/**
	 * Object的默认包装器
	 */
	var IMObject = {
		target: 'object',
		/**
		 * 返回对象的成员
		 * @param {String} member
		 */
		get: 'function(name)',
		/**
		 * 给对象成员赋值
		 * @param {String} member
		 * @param {Object} value
		 */
		set: 'function(member, value)',
		/**
		 * 调用对象的一个方法
		 * @param {String} funcName
		 * @param {Array} args
		 */
		invoke: 'function(funcName, args)',
		/**
		 * 调用对象的一个方法，并可指定作为this的对象
		 * @param {String} funcName
		 * @param {Object} thisp
		 */
		callFn: 'function(funcName, thisp/*, arg1, arg2,...**/)',
		/**
		 * 调用对象的一个方法，并可指定作为this的对象
		 * @param {String} funcName
		 * @param {Object} thisp
		 * @param {Array} args
		 */
		applyFn: 'function(funcName, thisp, args)',
		/**
		 * 使用wrapper包装自己
		 * @param {String} wrapperName 包装模块的名称
		 */
		wrap: 'function(wrapperName)',
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 * 声明对象实现了指定接口
		 * @param {IInterface|IInterface[]} 接口
		 */
		implement: 'function(ainterface)'
	}

	var MObject = $module({
		onIncluded: function(){
			$implement(IMObject, this);
		},
		get: function(member) {
			return this.target[member];
		},
		set: function(member, value) {
			this.target[member] = value;
			return this;
		},
		invoke: function(funcName, args){
			return this.target[funcName].apply(this.target, args);
		},
		callFn: function(funcName, thisp/*, arg1, arg2,...**/) {
			return this.target[funcName].apply(thisp, z._slice(arguments, 2));
		},
		applyFn: function(funcName, thisp, args){ 
			return this.target[funcName].apply(thisp, args);
		},
		wrap: function(wrapperName){
			$$(this, wrapperName);
			return this;
		},
		implement: function(ainterface){
			$implement(ainterface, this.target);
			return this;
		},
		include: function(module) {
			$include(module, this.target);
			return this;
		}
	});

	$.regist(MObject, Object);

	z.IMObject = IMObject;
	z.MObject = MObject;
});
$run(function() {
	eval($global.all);

	/**
	* @interface
	*/
	var IClass = {
		type: "function",
		member: {
			"baseProto": {type: "object", required: false},
			"__implns__": {type: "Array", required: false},
			"__cls_implns__": {type: "Array", required: false}
		}
	}

	/**
	 * @module
	 */
	var MClass = $module({
		onIncluded: function() {
			this.__cls_implns__ = [];
			this.implement(IClass);
		},
		/**
		 * 继承一个类
		 * @param {Object} base
		 */
		extend: function(base){
			$extend(this.target, base);
			delete this.extend; //防止多继承,只能用一次
			return this;
		},
		classImplement: function(ainterface){
			if(!this.target.__cls_implns__)this.target.__cls_implns__ = [];
			z._uniqPush(this.target.__cls_implns__, ainterface);
			return this.target;
		},
		getClassImplns: function() {
			return this.target.__cls_implns__;
		}
	});

	$.regist(MClass, Function, "toClass");

	z.IClass = IClass;

	z.MClass = MClass;

	function $class(m){
		return $$(m).toClass();	
	}
	$global("$class", $class);
});
$run(function() {
	eval($global.all);

	/**
	 * @interface
	 */
	var IBase = {
		/**
		 * 获取对象的成员
		 * @param {String} name
		 */
		get: "function(name)",
		/**
		 * 设置对象的成员
		 * @param {String} name
		 * @param {Object} value
		 */
		set: "function(name, value)",
		/**
		 * 返回对象的原型，o.__proto__
		 */
		proto: "function",
		/**
		 * 调用父原型(o.__proto__.__proto__)的方法
		 */
		base: "function()",
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 *定义properties
		 */
		property: "function()",
		/**
		 * 声明实现一个接口,引声明会加入到对象的已实现接口列表中
		 */
		implement: "function(ainterface)",
		/**
		 * 获取对象已经实现的接口
		 */
		getOwnImplns: "function()",
		/**
		 * 获取对象及其原型链对象的已实现接口
		 */
		getImplns: "function()"
	};

	/**
	 * Zobject
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function Base() {
		console.info("Base() callee");
		//this.__implns__ = [];
	}

	Base.prototype = $implement(IBase, {
		property: function() {
			$property.apply(this, [this].concat(z._slice(arguments)));
			return this;
		},
		include: function(module) {
			$include(module, this);
			return this;
		},
		get: function(name) {
			return this[name];
		},
		set: function(name, value) {
			this[name] = value;
		},
		proto: (function() {
			var SUPPORT_PROTO = {}.__proto__ != undefined;
			if(SUPPORT_PROTO) {
				return function() {
					return this.__proto__;
				};
			} else {
				return function() {
					if(this.constructor.prototype === this) {
						return this.constructor.baseProto;
					} else {
						return this.constructor.prototype;
					}
				};
			}
		})(),
		base: function() {
			var caller = this.base.caller;
			var currProto = null;
			var funcName = null;

			if(!funcName) {
				var self = this;
				//尝试从当前对象本身获取方法名
				z._everyKey(self, function(k) {
					if(self[k] == caller) {
						funcName = k;
						currProto = self.constructor.baseProto;
						return false;
					}
				}, this);

				//尝试从原型链上获取方法名
				if(!funcName){
					z._traceProto(this, function(proto){
						z._everyKey(proto, function(k){
							if(proto.hasOwnProperty(k) && proto[k] == caller){
								currProto = proto.constructor.baseProto;
								funcName = k;
								return false;
							}
						});
						if(proto.constructor == caller){
							funcName = "constructor";
							currProto = proto.constructor.baseProto;
						}
						if(currProto)return false;
					});
				}
			}else{//有方法名，确定当前调用在原型链的位置
				/*
				if(this[funcName] == caller){
					currProto = this.constructor.baseProto;
				}else{
					z._traceProto(this, function(proto){
						if(proto[funcName] == caller){
							currProto = proto.baseProto;
							return false;
						}
						if(currProto)return false;
					});
				}*/
			}

			if(funcName && currProto){
				var fn = currProto[funcName];
				if(fn && typeof fn == "function"){
					return fn.apply(this, arguments);
				}
			}


			/*
			//此处不能用caller.name，因为caller.name可能不是它在对象中的key
			var initializer = this.constructor;
			var funcName = null;
			*/

			/*
			while(initializer){
				if(caller === initializer){
					funcName = "constructor";
					proto = initializer.baseProto;
					break;
				}
				if(initializer.baseProto){
					initializer = initializer.baseProto.constructor;
				}else{
					initializer = null;
				}
			}

			if(!funcName) {
				z._everyKey(this, function(k) {
					if(this[k] == caller) {
						funcName = k;
					}
				}, this);
			}

			var protoFn =  proto ? proto[funcName] : null;
			if(!protoFn){
				z._traceProto(proto || this.proto(), function(proto) {
					var fn = proto[funcName];
					if(fn && fn != caller) {
						protoFn = fn;
						return false; //break;
					}
				});
			}

			if(typeof protoFn == "function") {
				return protoFn.apply(this, arguments);
			}
			*/
		},
		implement: function(ainterface) {
			$implement(ainterface, this);
		},
		getOwnImplns: function() {
			if(this.hasOwnProperty("__implns__")) {
				return this.__implns__.slice(0);
			} else {
				return [];
			}
		},
		getImplns: function() {
			var ar = this.getOwnImplns();
			var classImplns = this.constructor.getClassImplns && this.constructor.getClassImplns();
			if(!classImplns){
				classImplns = this.constructor.__class_implns__;
			}
			if(classImplns){
				z._uniqPush(ar, classImplns);
			}
			z._traceProto(this, function(proto) {
				if(proto.hasOwnProperty("__implns__")) {
					var ainterface = proto.__implns__;
					if(ainterface) ar = ar.concat(ainterface);
				}
			});
			return ar;
		}
	});

	//手动维护到Object的继承关系
	Base.prototype.constructor = Base;
	Base.baseProto = Object.prototype;

	$class(Base);

	z.IBase = IBase;

	z.Base = Base;
});$run(function() {
	eval($global.all);

	var ITypeSpec = {
			//是值类型还是引用类型，是哪种值类型
			typeOf: "[string]",

			//是哪个构造函数创建的
			instanceOf: "[object]",

			//原型链中包含哪些原型
			prototypeOf: "[object]" 
	}
	
	/**
	 * 解析ITypeSpec对象
	 * @param {ITypeSpec} spec 
	 */
	function _parseTypeSpec(spec) {
		var o = {};
		var t = typeof spec;
		if(t == "object")return spec;

		switch(t){
			case "string":
				o.typeOf = spec;
				break;
			case "function":
				o.instanceOf = spec;
				break;
			case "undefined":
				o.typeOf = t;
				break;
		}

		$implement(ITypeSpec, o);

		return o;
	}

	/**
	 * 检测对象是否为某种类型
	 * @param{Object|TypeSpec} type 类型规格
	 * @param{Object} o 要检验的对象
	 */
	function $is(type, o) {
		if(type === null)return type === o; // 检查对象是否为null

		//确保type是ITypeSpec对象
		type = _parseTypeSpec(type);

		//typeof 判断
		var t = type.typeOf;
		if(t){
			if(t.indexOf("function") != -1){ //function的声明可以写成function(p1, p2)的形式，这种形式一律视为function
				t = "function";
			}
			if(!(typeof(o) === t))return false;
		}

		//instanceof 判断
		if (type.instanceOf && !(o instanceof type.instanceOf)) return false;

		//prototypeof 判断
		var proto = type.prototypeOf;
		if (proto) {
			if(proto instanceof Array){
				if(!z._every(proto, function(aproto){
					return aproto.isPrototypeOf(o);
				}))return false;
			}else{
				if(!proto.isPrototypeOf(o))return false;
			}
		}

		return true;
	}

	z.ITypeSpec = ITypeSpec;
	z.parseTypeSpec = _parseTypeSpec; 

	$global("$is", $is);
});

$run(function() {
	eval($global.all);

	var IMemberSpec = {
		required: "boolean",
		type: [Object, Array],
		ownProperty: "boolean",
		check: "function(o, name)",
		value: Object
	}

	/**
	 * 对象的成员规格
	 * @todo 缓存常见的MemberSpec，缓存一个接口中重复的
	 * @param {Object} spec
	 */
	function MemberSpec(spec) {
		var self = arguments.callee;

		if(spec instanceof self){
				return spec;
		}

		var t = typeof spec;
		if (t == "string") {//字符表达式的形式表示MemberSpec.option
			z._copy(self.__parse(spec), this);
		}else if(t == "object"){
			z._copy(spec, this);
		}else if(t == "function"){ //声明此成员的constructor
			this.type = spec;
		}

		z._merge(arguments.callee.option, this);
	}

	MemberSpec.option = {
		required: true, //字符串表达式可用[]括住的表示非必须required=false
		type: null, //字符表达式可用|分隔多种不同的类型
		ownProperty: false
	}

	/**
	 * 解析成员规格字符表达式
	 * @param {String} exp
	 */
	MemberSpec.__parse = function(exp) {
		var spec = {};
		var m = exp.match(/^\[(.*)\]$/);
		if (m) {
			spec.required = false;
			exp = m[1];
		}

		if (exp.indexOf("|") != - 1) {
			spec.type = exp.split("|");
		} else {
			spec.type = exp;
		}
		return spec;
	}

	MemberSpec.prototype = $implement(IMemberSpec, {
		/**
		 * 检查对象成员是否符合成员规格
		 * @param {Object} o 成员的拥有者
		 * @param {String} name 成员的名称
		 */
		check: function(o, name) {
			var v = o[name];

			if(v == null){
				return !this.required;
			}


			if (this.type) {
				var t = this.type;
				if ($is(Array, t)) {
					var isType = false;
					for (var i = 0, l = t.length; i < l; i++) {
						if ($is(t[i], v)) {
							isType = true;
							break;
						}
					}

					if (!isType) return false;
				} else {
					if (!$is(t, v)) return false;
				}
			}

			if (this.ownProperty && ! o.hasOwnProperty(name)) return false;

			return true;
		}
	});

	$class(MemberSpec).extend(z.Base);

	z.MemberSpec = MemberSpec;
});

$run(function() {
	eval($global.all);

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		member: {
			base: "[object]",
			member: "[object]",
			type: z.ITypeSpec,
			freeze: "[boolean]"
		}
	});

	/**
	 * 接口
	 * @todo 验证数组的所有项都符合成员规格
	 * @param {Object} member 描述对象的成员
	 * @param {Object} type 描述对象的类型
	 */
	function parseInterface(member, type) {
		var o = {};
		o.base = null;
		o.freeze = false;
		o.type = type || Object; //type可以为Object或Function，如是其它的，可以通过base来指定
		o.member = member;

		// $implement(IInterface, o);

		if(member.member){//说明为hash形式的参数
			z._copy(member, o);
			o.type = member.type || Object; //确保忽略type参数，此时它应该定义在member.type
		}

		//if(typeof this.type == 'object'){
			//this.type = $spec(this.type);
		//}
		if(o.type){
			o.type = z.parseTypeSpec(o.type);
		}

		//将成员的描述实例化成为MemberSpec
		var MemberSpec = z.MemberSpec;
		var p, ms = o.member;
		for(p in ms){
			var m = ms[p];
			if(!(m instanceof MemberSpec)){
				ms[p] = new MemberSpec(m);
			}
		}

		return o;
	}

	/**
	 * 定义一个接口
	 * @param {Object} member 实现对象应包含的成员
	 * @param {string} type 对象本身的类型
	 * @param {Object} .base 父接口
	 * @param {Boolean} .freeze = false 是否可以拥有member定义以外的成员
	 */
	function $interface(member, type) {
		var o = parseInterface(member, type);
		$implement(IInterface, o);
		return o;
	}

	/**
	 * 检测某个对象是否符合接口描述
	 * @param {Interface} spec 接口
	 * @param {Object} o 被检测的对象
	 */
	function $support(spec, o) {
		if(!spec.__implns__ || spec.__implns__.indexOf(IInterface) == -1){
			spec = $interface(spec);
		}

		if (spec.base && !$support(spec.base, o))return false;

		if (spec.type && ! $is(spec.type, o)) return false;

		if (spec.member) {
			var k, ms = spec.member;
			for (k in ms) {
				if (!ms[k].check(o, k)) return false;
			}

			if (spec.freeze) {
				var allms = {};
				z._trace(spec, 'base', function(base){
					z._merge(base.member, allms);
				});

				for (k in o) {
					if (! (k in allms)) return false;
				}
			}
		}

		return true;
	}

	z.IInterface = IInterface;

	$global("$interface", $interface);

	$global("$support", $support);
});

$run(function() {
	eval($global.all);

	function _setRequiredWithFalse(option){
		var k, a, t;
		for(k in option){
			a = option[k];
			t = typeof a;
			if(t == "object"){
				if(!a.hasOwnProperty["required"]){
					a.required = false;
				}
			}else if(t == "object"){
				option[k] = {
					type: t,
					required: false
				}
			}
		}
		return option;
	}

	/**
	 * 合并参数
	 * @param {Object} params 手动指定对象作为key/value参数，此参数通常从方法参数获取
	 * @param {IInterface} paramSpec 手动指定方法的参数的接口，此参数通过从方法的option属性获取
	 */
	function $option(/*params, paramSpec*/) {
		var args       = arguments,
			realFn     = $fnself().caller,
			params     = args[0] || realFn.arguments[0] || {};

		var option = args[1] || realFn.option;

		option = _setRequiredWithFalse(option);

		var	paramSpec  = $interface(option);

		if($support(paramSpec, params)){
			return __mergeOption(params, paramSpec.member);
		}else{
			throw "arguments invalid";
		}
	}


	function __mergeOption(params, deft) {
		var k;
		for (k in deft) {
			if (!(k in params)) {
				params[k] = deft[k].value;
			}
		}
		return params;
	}


	$global("$option", $option);
});

$run(function() {
	eval($global.all);


	function $overload(/*fn1, fn2,{[String, Number]: fn3, [ITypeSpec, String]: fn4]} */){
		var main = function(){
			var args = arguments;
			var fn = _findFuncByParams(args.callee.fnMap, args);
			if(fn){
				return fn.apply(this, arguments);
			}
		}

		main.fnMap = _makeFnMap(arguments);

		main.overload = function(fn, argsSpec){
			if(!fn)return;

			var args = [];
			if(fn && argsSpec){
				args.push([fn, argsSpec]);
			}else{
				args.push(fn);
			} 

			_makeFnMap(args, this.fnMap);
		}

		return main;
	}


	var IFuncBox = {
		params: Array,
		fn: Function,
		useOption: Boolean
	}

	/**
	 * 建立一个形参个数对应IFuncBox的map
	 * @return {1: IFuncBox[], 2: IFuncBox[], ... }
	 */
	function _makeFnMap(args, argcToFuncMap){
		argcToFuncMap = argcToFuncMap || {};  //{1: [fnBox1, fnBox2], 2: [fnBox3]}
		var map = map || {};
		var fns = [];

		var a,t,i,l,params;
		for(i=0,l=args.length; i<l; i++){
			a = args[i];
			t = typeof a;
			if(t == "function"){
				if(!a.option)throw "function did not defined option property"
				fns.push({params: [Object], fn: a, useOption: true });
			}else if($is(Array, a)){
				fns.push({params: a[1], fn: a[0], useOption: false});
			}
		}


		var fnBox, count;
		for(i=0,l=fns.length; i<l; i++){
			fnBox = fns[i];
			count = fnBox.params.length;
			if(!argcToFuncMap[count])argcToFuncMap[count] = [];
			argcToFuncMap[count].push(fnBox);
		}

		return argcToFuncMap;
	}

	/**
	 * @param {Object} type 形参的类型声明
	 * @param {Object} param 实参
	 */
	function _matchParamType(type, param){
		var pt = typeof param; //实际参数的类型
		var tt = typeof type; //string: 值类型, function: IClass, object: ITypeSpec

		if(tt !== "string" || type === "object"){//形参声明为引用类型
			if(pt === "object" || pt === "function"){ //实参为引用类型 
				if($is(type, param)){ return true; }
			}else{ //如果实参是值类型,但形参是其值类型对应的引用类型,则也算通过
				var map = {
					"string": String,
					"number": Number,
					"boolean": Boolean
				}
				if(map[pt] === type){ return true; }
			}
		}else{ //形参声明为值类型
			if(pt == tt){ return true; }
		}
		return false;
	}

	/**
	 * 根据实参和[方法形参map]查找出匹配的方法
	 */
	function _findFuncByParams(map, args){
		var fns = map[args.length];
		if(!fns)return;

		var arg0 = args[0];
		var isConfig = args.length == 1 && typeof arg0 === "object";

		var i=0, l, j, k, fnBox, fn, params, option, arg0;
		for(i=0,l=fns.length; i<l; i++){
			fnBox = fns[i];
			fn = fnBox.fn;
			params = fnBox.params;

			if(fnBox.useOption){
				if(isConfig && z._isPlainObject(arg0)){
					option = fn.option;
					var argsCountLessThanOption = z._keys(option).length >= z._keys(arg0).length; 
					if(argsCountLessThanOption && $support(option, arg0)){
						return fn;
					}
				}
				continue;
			}else{
				var isMatched = true;
				for(j=0, k=params.length; j<k; j++){
					isMatched = _matchParamType(params[j], args[j]);
					if(!isMatched)break;
				}
				if(isMatched)return fn;
			}
		}
	}

	$global("$overload", $overload);

});

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
	var MEvent = $module({
		/**
		 * 被包含时初始化引用监听者的map
		 */
		onIncluded: function(){
			this.__listeners = {};
			$implement(IEvent, this);
		},
		/**
		 * 添加监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		addListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)all = this.__listeners[eventName] = [];
			all.push(listener);
			return this;
		},
		/**
		 * 移除监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		removeListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)return;
			this.__listeners[eventName] = all.filter(function(item){return item != listener});
			return this;
		},
		/**
		 * 获取所有监听者
		 * @param {String} eventName 事件名
		 */
		getListerners: function(eventName){
			return this.__listeners[eventName];
		},
		/**
		 * 触发事件
		 * @param {String} eventName 事件名
		 * @param {Array} args 传递给事件监听者的参数
		 */
		fire: function(eventName, args){
			this.getListerners(eventName).forEach(function(listener){
				listener(args);
			});
			return this;
		}
	});

	z.MEvent = MEvent;
});
$run(function() {
	eval($global.all);

	/**
	 * 检视对象
	 * @module
	 */
	var MInspect = $module({
		/**
		 * 返回对象的所有方法
		 */
		methods: function(){
			var keys = this.allKeys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] == "function";
			});
		},
		/**
		 * 返回对象的所有公开方法
		 */
		publicMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return !z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有私有方法
		 */
		privateMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有数据成员
		 */
		fields: function(){
			var keys = this.allKeys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] != "function";
			});
		},
		/**
		 * 返回对象的所有公有数据成员
		 */
		publicFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return !z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有私有数据成员
		 */
		privateFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的非原型链上成员的名称
		 */
		keys: function(){
			return Object.keys(this.target);
		},
		/**
		 * 返回对象的所有成员的名称
		 */
		allKeys: function(){
			return z._keys(this.target);
		},
		/**
		 * 返回对象的typeof值
		 */
		type: function(){
			return typeof this.target;
		},
		/**
		 * 返回对象的原型链
		 */
		protoLink: function(){
			var protos = [];
			z._traceProto(this.target, function(p){
				protos.push(p);
			});
			return protos;
		},
		/**
		 * 返回对象的原型
		 */
		proto: function(){
			var t = this.target;
			var supportedProto = {}.__proto__ !== undefined;
			return supportedProto ? t.__proto__ : t.constructor.prototype;
		},
		/**
		 * 返回对象的constructor
		 */
		creator: function(){
			return this.target.constructor;
		},
		/**
		 * 返回对象已实现的接口
		 */
		implns: function(){
			var ar = this.__implementions__;
			return (ar ? [] : ar.slice(0));
		}
	});


	z.MInspect = MInspect;

	$.regist(MInspect, Object, "inspect");

	/**
	 * 检视对象，返回一个包含了MInspect模块的对象
	 * @param {Object} o
	 * @global
	 */
	function $inspect(o){
		return $(o).inspect();
	}

	$global("$inspect", $inspect);
});
