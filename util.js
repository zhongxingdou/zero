(function() {
	/**
	 * 遍历数组或集合对象
	 * @param {Array|Object} obj 
	 * @param {Function} fn(item) 如果fn返回false，将中止遍历
	 */
	function $each(obj, fn, scope) {
		if (!obj) return true;
		for (var i = 0, l = obj.length; i < l; i++) {
			if ($call(fn, [obj[i]], scope) === false) return false;
		}
		return true;
	}

	/**
	 * 遍历对象的所有成员 
	 */
	function $eachKey(o, fn, scope){
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
	function $array(obj, start) {
		if(obj instanceof Array)return obj;
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
		$each(args, function(p){
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
	 * clone对象
	 * @param {Ojbect} o 
	 * @param {Boolean} isDeepClone=false
	 */
	/*
	function $clone(o, isDeepClone) {
		var newo;
		if (o.constructor == Object) {
			newo = {}
		} else {
			var fn = function(){};
			fn.prototype = o.constructor.prototype;
			newo = new fn();
			//newo = new o.constructor(o.valueOf());
		}

		if (!isDeepClone) {
			for (var key in o) {
				newo[key] = o[key];
			}
		} else {
			for (var key in o) {
				var v = o[key];
				if (newo[key] != v) { //防止循环clone
					if (typeof(v) == 'object') {
						newo[key] = $clone(v);
					} else {
						newo[key] = v;
					}
				}
			}
		}

		newo.toString = o.toString;
		newo.valueOf = o.valueOf;

		return newo;
	}*/

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
	function $getAllMembers(o){
		var p, members = [];
		for(p in o){ 
			members.push(p);
		}
		return members;
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
	 * 生成属性方法的工厂函数
	 * @description
	 * $property(o, 'name', '@RW')
	 * 将会生成o.getName,o.setName方法，这两个方法将从o.__name设置或访问值
	 */
	function $property(o, name, accessor){
		var args = $option(), 
			name = args.name, 
			o = args.scope, 
			rw = args.accessor;
		var upName = name.slice(0, 1).toUpperCase() + name.slice(1);
		var privateName = arguments.callee.getPrivateName(name);
		var rw = rw.toUpperCase();

		if (rw.indexOf("R") != - 1) {
			o["get" + upName] = function() {
				return o[privateName];
			};
		}
		if (rw.indexOf("W") != - 1) {
			o["set" + upName] = function(value) {
				o[privateName] = value;
			}
		}
	}

	$property.getPrivateName = function(name){
		return "__" + name;
	}

	$property.set = function(o, name, value){
		var privateName = this.getPrivateName(name);
		o[privateName] = value;
		return o;
	}

	$property.get = function(o, name){
		var privateName = this.getPrivateName(name);
		return o[privateName];
	}


	$property.option = {
		scope: undefined,
		name: undefined, //lowercase
		accessor: "@RW" //upcase @RW
	}

	/**
	 * 调用父原型的方法
	 */
	function $callBase(o, name, args) {
		if(arguments.length == 1 || $is(Array, name)){
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

	function $callWithArray(fn, args, scope){
		if(args instanceof Array){
			return $each(args, fn, scope);
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
		$each(arguments, function(k){
			o[k] = {};
		});
		return o;
	}

	$global("$each", $each);
	$global("$copy", $copy);
	$global("$array", $array);
	$global("$clone", $clone);
	$global("$like", $like);
	$global("$merge", $merge);
	$global("$option", $option);
	$global("$getAllMembers", $getAllMembers);
	$global("$eachKey", $eachKey);
	$global("$traceProto", $traceProto);
	$global("$getProtoMember", $getProtoMember);
	$global("$callBase", $callBase);
	$global("$property", $property);
	$global("$trace", $trace);
	$global("$call", $call);
	$global("$callWithArray", $callWithArray);
})();

