(function(HOST) {
	eval($global.all);

	/**
	 * 遍历数组或集合对象
	 * @param {Array|Object} obj 
	 * @param {Function} fn(item) 如果fn返回false，将中止遍历
	 */
	function $every(obj, fn, scope) {
		if (!obj) return true;
		for (var i = 0, l = obj.length; i < l; i++) {
			if (fn.apply(scope, [obj[i]]) === false) return false;
		}
		return true;
	}


	/**
	 * 遍历对象的所有成员 
	 */
	function $everyKey(o, fn, scope){
		if(typeof fn != "function")return false;

		for(p in o){ 
			if(fn.apply(scope, [p, o[p]]) === false)return false;
		}

		return true;
	}

	/**
	 * 根据指定属性来追溯
	 */
	function $trace(o, name, fn, scope){
		var p = o;
		while(p){
			if(fn.apply(scope, [p]) === false)return false;
			p = p[name];
		}
		return true;
	}

	var SUPPORTED_PROTO = {}.__proto__ !== undefined;

	/**
	 * 遍历对象的原型链，从下向上
	 */
	if(SUPPORTED_PROTO){
		function $traceProto(o, fn, scope) {
				return $trace(o.__proto__, '__proto__', fn, scope);
		}
	}else{
		function $traceProto(o, fn, scope) {
			var proto = o.constructor.prototype;
			if(proto == o){
				proto = o.constructor.baseProto;
			}

			while(proto){
				if(fn.apply(scope, [proto]) === false)return false;
				proto = proto.constructor.baseProto;
			}

			if(o.constructor !== Object){
				if(fn.apply(scope, [Object.prototype]) === false)return false;
			}
		}
	}

	/**
	 * 把集合对象转换成Array
	 * @param {Object} obj 被转换的对象
	 * @param {Object} start=0 从集合对象中的第几项开始转换 
	 */
	function $slice(obj, start) {
		return Array.prototype.slice.apply(obj, [start || 0]);
	}

	/**
	 * copy对象成员到另一个对象
	 * @param {Object} from
	 * @param {Object} to
	 */
	function $copy(from, to) {
		var p;

		for (p in from) {
			to[p] = from[p];
		}

		return to;
	}

	/**
	 * 如果目标已经存在,则不覆盖
	 * @example
	 * function fn(args){
	 *     var dftOption = {param: true}
	 *     $merge(dftOption, args);
	 * }
	 */
	function $merge(from, to) {
		var p;

		for (p in from) {
			if (!(p in to)) {
				to[p] = from[p];
			}
		}

		return to;
	}




	/**
	 * 浅clone
	 */
	function $clone(obj) {
		function Clone() { } 
		Clone.prototype = obj;
		var c = new Clone();
		//c.constructor = Clone;
		return c;
	}


	/**
	 * 判断两个对象是否相似
	 */
	function $like(a, b) {
		if (a == b) return true;

		if (typeof a != typeof b) return false;

		for (var k in a) {
			if (a[k] != b[k]) {
				if (!$like(a[k], b[k])) return false;
			}
		}
		return true;
	}

	/**
	 * 返回对象的所有成员，但不包括原型链中原生原型所包含的成员
	 */
	function $allKeys(o){
		var p, keys = [];
		for(p in o){ 
			keys.push(p);
		}
		return keys;
	}

	/**
	 * 获取原型链上的成员
	 */
	function $getProtoMember(o, name){
		var proto = SUPPORTED_PROTO ? o.__proto__ : o.constructor.prototype;
		if(!proto)return;

		if (name.indexOf("proto.") != - 1) {
			var uplevel = name.split("proto.").length - 1;
			var base;
			for (var i = 1; i < uplevel && proto; i++) {
				base = SUPPORTED_PROTO ? proto.__proto__ : (proto.constructor.baseProto || Object.prototype);
				if(proto === base)break;
				proto = base;
			}
			if (proto) {
				name = name.slice(name.lastIndexOf(".") + 1);
			}
		}

		return proto[name];
	}

	/**
     * Object.definedProperties的快捷方式
	 */
	function $property(){
		var l = arguments.length;
		if(l > 2){
			Object.definedProperties.apply(Object, arguments);
		}else{
			Object.definedProperty.apply(Object, arguments);
		}
	}

	function $callBase(obj, args){
		var caller = $callBase.caller;
		//此处不能用caller.name，因为caller.name可能不是它在对象中的key
		var fnName = (caller == obj.constructor) ? "constructor" : undefined;
		if(!fnName){
			$everyKey(obj, function(k){
				if(obj[k] == caller){
					fnName = k;
				}
			}, obj);
		}


		var protoFn = null;
		$traceProto(obj.__proto__ || obj.constructor.prototype, function(proto){
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


	function $callWithAll(fn, args, scope){
		var isArray = args instanceof Array;
		if(isArray){
			return $every(args, fn, scope);
		}else{
			return fn.apply(scope, [args]);
		}
	}

	/**
	 * 声明一个枚举
	 * @example
	 * var color = $enum("BLUE", "RED", "YELLOW");
	 * color.BLUE
	 * color.RED
	 * color.YELLOW
	 */
	function $enum(obj){
		if(arguments.length == 1 && typeof obj == "object"){
			return obj;
		}

		var o = {};
		$every(arguments, function(k){
			o[k] = {};
		});
		return o;
	}

	/***
	 * 运行一个方法，避免产生全局变量
	 */
	function $run(fn){
		"use strict"
		var thisObj = {};
		fn.apply(thisObj, arguments);
		return thisObj;
	}


	/**
	 * 判断一个成员的名字是否符合表示私有
	 */
	function $isPrivate(name){
		return name.toString().match(/^__/);
	}

	function $thisFn(){
		return $thisFn.caller;
	}

	function $fn(fn, option){
		if(option){
			fn.option = option;
		}
		return fn;
	}

	function $hasSubset(set, sub) {
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


	//遍历
	var vars = ["$every", "$everyKey", "$trace"];

	//操作与比较
	vars.push("$copy", "$merge", "$clone", "$like");

	//工厂
	vars.push("$slice","$enum","$property");

	//方法相关
	vars.push("$callWithAll");

	//反射
	vars.push("$traceProto", "$callBase",  "$getProtoMember");

	vars.push("$isPrivate", "$allKeys", "$thisFn", "$hasSubset");

	var name;
	while(name = vars.pop()){
		$global(name, eval(name));
	}
	
})(this);

