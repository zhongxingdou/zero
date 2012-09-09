(function(HOST) {
	eval($global.all);

	/**
	 * 包含一个module到对象
	 * @param {IModule} module 
	 * @param {Object} toObj 
	 */
	function $include(module, toObj, exclude) {
		var exclude = exclude || [];
		exclude = exclude.concat("onIncluded","__implementations__");

		z._everyKey(module, function(k, v){
			if(exclude.indexOf(k) == -1){
				toObj[k] = v;
			}
		});

		if(module.onIncluded){
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
		if(old){
			z._copy(old, proto);
		}

		proto.constructor = clazz;
		clazz.baseProto = base.prototype;
	}


	/**
	* 声明对象实现了某接口，并将接口存入__implementations__中
	*/
	function $implement(ainterface, o){
		var implns = o.__implementations__;
		if(!implns){ 
			 o.__implementations__ = ainterface instanceof Array ? ainterface.slice[0] : [ainterface];
		}else{
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
		if(o instanceof Array){
			for(var i=0, l=o.length; i<l; i++){
				_uniqPush(ar, o[i]);
			}
			return;
		}

		if(ar.indexOf){
			if(ar.indexOf(o) == -1){
				ar.push(o);	
			}
		}else{
			var l = ar.length;
			while(l--){
				if(ar[l] == o)return;
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
	function _everyKey(o, fn, thisp){
		if(typeof fn != "function")return false;

		for(p in o){ 
			if(fn.apply(thisp, [p, o[p]]) === false)return false;
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
	function _trace(o, prop, fn, thisp){
		var a = o;
		while(a){
			if(fn.apply(thisp, [a]) === false)return false;
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
	if(SUPPORTED_PROTO){
		function _traceProto(o, fn, thisp) {
				return _trace(o.__proto__, '__proto__', fn, thisp);
		}
	}else{
		function _traceProto(o, fn, thisp) {
			var proto = o.constructor.prototype;
			if(proto == o){
				proto = o.constructor.baseProto;
			}

			while(proto){
				if(fn.apply(thisp, [proto]) === false)return false;
				proto = proto.constructor.baseProto;
			}

			if(o.constructor !== Object){
				if(fn.apply(thisp, [Object.prototype]) === false)return false;
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
	function $array(items){
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
	function _keys(o){
		var p, keys = [];
		for(p in o){ 
			keys.push(p);
		}
		return keys;
	}


	function _makeSetter(name){
		return Function(name+"=arguments[0]");
	}

	function _makeGetter(name){
		return Function("return " + name);
	}

	/**
     * Object.definedProperties的快捷方式
	 */
	function $property(){
		var args = arguments;
		var l = args.length;
		var obj = args[0];
		var t = typeof args[1];
		if(t == "string"){
			var name = args[1];
			var config = args[2] || {};
			if(!config.set){
				config.set = _makeSetter(name);
			}
			if(!config.get){
				config.get = _makeGetter(name);
			}
			Object.defineProperty(obj, name, config);
		}else if(t == "object"){
			z._everyKey(args[1], function(name, config){
				$property(obj, name, config);
			});
		}
	}

	/**
	 * 用于方法在自己内部调用thisp原型链上的同名方法
	 * @param {Object} o
	 * @param {Array} args 参数
	 */
	function $callbase(obj, args){
		var caller = $callbase.caller;
		//此处不能用caller.name，因为caller.name可能不是它在对象中的key
		var fnName = (caller == obj.constructor) ? "constructor" : undefined;
		if(!fnName){
			z._everyKey(obj, function(k){
				if(obj[k] == caller){
					fnName = k;
				}
			}, obj);
		}


		var protoFn = null;
		_traceProto(obj.__proto__ || obj.constructor.prototype, function(proto){
			var o = proto[fnName];
			if(o){
				protoFn = o;
				return false; //break;
			}
		});

		if(typeof protoFn == "function"){
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
	function $enum(obj){
		if(arguments.length == 1 && typeof obj == "object"){
			return obj;
		}

		var o = {};
		z._every(arguments, function(k){
			o[k] = {};
		});
		return o;
	}

	/***
	 * 运行一个方法，避免产生全局变量
	 * @param {Function} fn 要运行的方法
	 */
	function $run(fn){
		var thisObj = {};
		fn.apply(thisObj, arguments);
		return thisObj;
	}


	/**
	 * 判断一个成员的名字是否符合表示私有
	 * @param {String} name
	 * @return Boolean
	 */
	function _isPrivate(name){
		return name.toString().match(/^_/);
	}

	/**
	 * 在方法内部调用，返回方法自身，避免使用方法名来引用自身
	 */
	function $fnself(){
		return $fnself.caller;
	}

	/**
	 * 把option添加到指定的fn上
	 * @param {Function} fn 
	 * @param {Object} option
	 */
	function $fn(fn, option){
		if(option){
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
		var k,
			count = 0;

		for(var i=0, l=sub.length; i<l; i++){
			if(set.indexOf(sub[i]) != -1){ //exists
				count++;
			}else{
				return false;
			}
		}

		return count > 0;
	}

	$global("$run", $run);
	HOST.$run = $run;


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
	
	var vars = [];
	vars.push("$implement", "$extend", "$callbase","$include");
	vars.push("$enum","$property", "$array", "$fn");
	vars.push("$fnself");

	var name;
	while(name = vars.pop()){
		$global(name, eval(name));
	}
})(this);

