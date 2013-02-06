(function(host) {
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
		 * exportTo(["$protocol", "$module"], window);
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
	};


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

    var $log = function(){};
    $log.info = function(){};
    $log.warn = function(){};
    $log.debug = function(){};
    $log.error = function(){};

    if(typeof console != "undefined"){
        if(typeof console.log == "function"){
            $log = function(msg){
                console.log(msg);
            };
        }

        var types = ["info","warn","error","debug"];
        var l = types.length;
        while(l--){
            var t = types[l-1];
            if(typeof console[t] == "function"){
                $log[t] = (function(type){
                    return function(msg){
                        console[type](msg);
                    };
                })(t);
            }
        }
    }

    $global("$log", $log);
});
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
        exclude = exclude || [];
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
    function $implement(protocol, o) {
        var implns = o.__implns__;
        if (!implns) {
            o.__implns__ = protocol instanceof Array ? protocol.slice(0) : [protocol];
        } else {
            z._uniqPush(implns, protocol);
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
            var k = ar.length;
            while (k--) {
                if (ar[k] == o) return;
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

        for (var p in o) {
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
    function $trace(o, prop, fn, thisp) {
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
    function $base(obj, args, caller) {
        // !!!此处不能用caller.name，因为caller.name可能不是它在对象中的key
        var self = obj;
        caller = caller || arguments.callee.caller;
        var currProto = null;
        var funcName = null;

        if(!funcName) {
            //尝试从当前对象本身获取方法名
            z._everyKey(self, function(k) {
                if(self[k] == caller) {
                    funcName = k;
                    currProto = self.constructor.baseProto;
                    return false;
                }
            });

            //尝试从原型链上获取方法名
            if(!funcName){
                z._traceProto(self, function(proto){
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
        }

        if(funcName && currProto){
            var fn = currProto[funcName];
            if(fn && typeof fn == "function"){
                return fn.apply(self, args);
            }
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
    function $fn() {
        return $fn.caller.apply(this, arguments);
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


    z._every = _every;
    z._everyKey = _everyKey;

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

    var $clone = function(obj) {
        var objClone;
        if ( obj.constructor == Object ) objClone = new obj.constructor();
        else objClone = new this.constructor(obj.valueOf());
        for ( var key in obj ) {
            if ( objClone[key] != obj[key] ) {
                if ( typeof(obj[key]) == 'object' ) {
                    objClone[key] = $fn(obj[key]);
                } else {
                    objClone[key] = obj[key];
                }
            }
        }
        objClone.toString = obj.toString;
        objClone.valueOf = obj.valueOf;
        return objClone;
     };

    $global("$implement", $implement);
    $global("$extend", $extend);
    $global("$base", $base);
    $global("$include", $include);
    $global("$enum",  $enum);
    $global("$property", $property);
    $global("$fn",  $fn);
    $global("$clone", $clone);
    $global("$trace", $trace);
});
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
$run(function(){
	eval($global.all);

	/**
	* IObject
	* @protocol
	*/
	var IObject = {
		__implns__: Array
	};

	/**
	 * IModule
	 * @protocol
	 */
	var IModule = {
		onIncluded: "[function()]"
	};


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
		 * 使用wrapper包装自己
		 * @param {String} wrapperName 包装模块的名称
		 */
		wrapWith: 'function(wrapperName)',
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 * 声明对象实现了指定接口
		 * @param {IInterface|IInterface[]} 接口
		 */
		implement: 'function(protocol)'
	};

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
		wrapWith: function(wrapperName){
			$$(this, wrapperName);
			return this;
		},
		implement: function(protocol){
			$implement(protocol, this.target);
			return this;
		},
		include: function(module) {
			$include(module, this.target);
			return this;
		}
	});

	$.regWrapper(MObject, Object);

	z.IMObject = IMObject;
	z.MObject = MObject;
});
$run(function() {
	eval($global.all);

	/**
	* @protocol
	*/
	var IClass = {
		type: "function",
		member: {
			"baseProto": {type: "object", required: false},
			"__implns__": {type: "Array", required: false},
			"__cls_implns__": {type: "Array", required: false}
		}
	};

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
		classImplement: function(protocol){
			if(!this.target.__cls_implns__)this.target.__cls_implns__ = [];
			z._uniqPush(this.target.__cls_implns__, protocol);
			return this.target;
		},
		getClassImplns: function() {
			return this.target.__cls_implns__;
		}
	});

	$.regWrapper(MClass, Function, "MClass");

	z.IClass = IClass;

	z.MClass = MClass;

	function $class(m){
		return $(m).wrapWith("MClass");
	}
	$global("$class", $class);
});
$run(function() {
	eval($global.all);

	/**
	 * @protocol
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
		implement: "function(protocol)",
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
		// $log("Base callee");
		this.__implns__ = [];
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
			return $base(this, arguments, arguments.callee.caller);
		},
		implement: function(protocol) {
			$implement(protocol, this);
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
					var protocol = proto.__implns__;
					if(protocol) ar = ar.concat(protocol);
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
	};
	
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
			if(typeof(o) !== t)return false;
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
	};

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
	};

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
	};

	MemberSpec.prototype = $implement(IMemberSpec, {
		/**
		 * 检查对象成员是否符合成员规格
		 * @param {Object} o 成员的拥有者
		 * @param {String} name 成员的名称
		 */
		check: function(o, name) {
			var v = o[name];

			if(v === null || v === undefined){
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
	var IInterface = $protocol({
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
	function $protocol(member, type) {
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
			spec = $protocol(spec);
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
				$trace(spec, 'base', function(base){
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

	$global("$protocol", $protocol);

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
				};
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
			realFn     = arguments.callee.caller,
			params     = args[0] || realFn.arguments[0] || {};

		var option = args[1] || realFn.option;

		option = _setRequiredWithFalse(option);

		var	paramSpec  = $protocol(option);

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
		};

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
		};

		return main;
	}


	var IFuncBox = {
		params: Array,
		fn: Function,
		useOption: Boolean
	};

	/**
	 * 建立一个形参个数对应IFuncBox的map
	 * @return {1: IFuncBox[], 2: IFuncBox[], ... }
	 */
	function _makeFnMap(args, argcToFuncMap){
		argcToFuncMap = argcToFuncMap || {};  //{1: [fnBox1, fnBox2], 2: [fnBox3]}
		var map = map || {};
		var fns = [];

		var a,t,i,l;
		for(i=0,l=args.length; i<l; i++){
			a = args[i];
			t = typeof a;
			if(t == "function"){
				if(!a.option){
					fns.push({params: [], fn: a, useOption: false});
				}else{
					fns.push({params: [Object], fn: a, useOption: true });
				}
			}else if($is(Array, a)){
				var a1 = a[1];
				if($is(Array, a1)){
					fns.push({params: a1, fn: a[0], useOption: false});
				}else if(z._isPlainObject(a1)){
					a[0].option = a[1];
					fns.push({params: [Object], fn: a[0], useOption: true});
				}
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
			if(pt === "object" || pt === "function"){//实参为引用类型
				if($is(type, param)){ return true; }
			}else{ //如果实参是值类型,但形参是其值类型对应的引用类型,则也算通过
				var map = {
					"string": String,
					"number": Number,
					"boolean": Boolean
				};
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

		var i=0, l, j, k, fnBox, fn, params, option;
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
	};
	
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
		on: this.addListener,
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
		un: this.removeListener,
		/**
		 * 移除监听者
		 * @param {String} eventName 事件名
		 * @param {Object} listener
		 */
		removeListener: function(eventName, listener){
			var all = this.__listeners[eventName];
			if(!all)return;
			this.__listeners[eventName] = all.filter(function(item){return item != listener;});
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

	$.regWrapper(MInspect, Object, "MInspect");

	/**
	 * 检视对象，返回一个包含了MInspect模块的对象
	 * @param {Object} o
	 * @global
	 */
	function $inspect(o){
		return $(o).wrapWith("MInspect");
	}

	$global("$inspect", $inspect);
});

