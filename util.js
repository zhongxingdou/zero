(function() {
	eval($global.all);

	/**
	 * 遍历数组或集合对象
	 * @param {Array|Object} obj 
	 * @param {Function} fn(item) 如果fn返回false，将中止遍历
	 */
	function $every(obj, fn, scope) {
		if (!obj) return true;
		for (var i = 0, l = obj.length; i < l; i++) {
			if ($call(fn, [obj[i]], scope) === false) return false;
		}
		return true;
	}


	/**
	 * 遍历对象的所有成员 
	 */
	function $everyKey(o, fn, scope){
		if(typeof fn != "function")return false;

		for(p in o){ 
			if($call(fn, [p, o[p]], scope)=== false)return false;
		}

		return true;
	}

	/**
	 * 根据指定属性来追溯
	 */
	function $trace(o, name, fn, scope){
		var p = o;
		while(p){
			if($call(fn,[p], scope) === false)return false;
			p = p[name];
		}
		return true;
	}

	/**
	 * 遍历对象的原型链，从下向上
	 */
	function $traceProto(o, fn, scope) {
		var supportProto = {}.__proto__ !== undefined;
		
		var proto = supportProto ? o.__proto__ : o.constructor.prototype;
		return $trace(proto, '__proto__', fn, scope);
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
	 * 将以逗号分隔的参数转换成Option，并合并默认参数
	 * @example
	 * function fn(p1, p2){
	 *     var option = $option();
	 *     ....
	 * }
	 * fn("k1", "k2") //option = {key1: "k1", key2: "k2", key3: true}
	 * fn.option = {key1: null, key2: null, key3: true}
	 */
	function $option() {
		var fn = $option.caller,
			deft = fn.option, 
			option = {},
			args = fn.arguments,
			l = args.length;
		
		var count = 0;
		$every(args, function(p){
			if(p != undefined) count++;
		});

		if (count == 1 && args[0] != undefined) { //参数只有一个时，认为它是参数对象，而不是参数数组中的第一个
			return $merge(deft, args[0]);
		}else{
			var k, i = 0;
			for (k in deft) {
				if (i < l) {
					option[k] = args[i];
					i++;
				} else {
					option[k] = deft[k];
				}
			}
		}

		return option;
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
	function $getAllKeys(o){
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
		var supportProto = {}.__proto__ !== undefined;
		
		var proto = supportProto ? o.__proto__ : o.constructor.prototype;
		if(!proto)return;

		if (name.indexOf("proto.") != - 1) {
			var uplevel = name.split("proto.").length - 1;
			var base;
			for (var i = 1; i < uplevel && proto; i++) {
				base = proto.__proto__;
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

	/**
	 * 调用父原型的方法
	 */
	function $callBase(o, name, args) {
		if(arguments.length == 1 || name instanceof Array){
			args = name;
			var fn = $getProtoMember(o, "proto.proto.constructor");
			if(fn){
				fn.apply(o, args || []);
			}
			return;
		}

		var p = $getProtoMember(o, "proto.proto."+name);
		if (typeof p != "function") {
			throw "can't respond to " + '"' + name + '"';
		}
		return p.apply(o, args || []);
	}


	/**
	 * 调用一个方法，调用之前先判断是否为方法
	 */
	function $call(fn, args, scope){
		if(typeof fn  === "function"){
			if(scope === undefined && "scope" in fn){
				scope = fn['scope'];
			}
			return fn.apply(scope, args || []);
		}
	}

	function $callWithAll(fn, args, scope){
		var isArray = args instanceof Array;
		if(isArray){
			return $every(args, fn, scope);
		}else{
			return $call(fn, [args], scope);
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
	function $enum(){
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
		return fn.apply({}, arguments);
	}


	/**
	 * 判断一个成员的名字是否符合表示私有
	 */
	function $isPrivate(name){
		return name.toString().match(/^__/);
	}

	$global("$run", $run);
	this.$run = $run;


	//遍历
	var vars = ["$every", "$everyKey", "$trace"];

	//操作与比较
	vars.push("$copy", "$merge", "$clone", "$like");

	//工厂
	vars.push("$slice","$enum","$property");

	//方法相关
	vars.push("$call", "$callWithAll", "$option");

	//反射
	vars.push("$traceProto", "$callBase",  "$getProtoMember");

	vars.push("$isPrivate");
	

	var name;
	while(name = vars.pop()){
		$global(name, eval(name));
	}
	
})();

