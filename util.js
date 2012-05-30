(function() {
	/**
	 * 遍历数组或集合对象
	 * @param {Array|Object} obj 
	 * @param {Function} fn(item) 如果fn返回false，将中止遍历
	 */
	function $each(obj, fn) {
		if (!obj) return true;
		for (var i = 0, l = obj.length; i < l; i++) {
			if (fn(obj[i]) === false) return false;
		}
		return true;
	}

	/**
	 * 把集合对象转换成Array
	 * @param {Object} obj 被转换的对象
	 * @param {Object} start=0 从集合对象中的第几项开始转换 
	 */
	function $makeArray(obj, start) {
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
	function $clone(o, isDeepClone) {
		if (o.constructor == Object) {
			newo = {}
		} else {
			newo = new o.constructor(o.valueOf());
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
	 * 遍历对象的原型链，从下向上
	 */
	function $eachProto(o, fn) {
		var proto = o.__proto__ || o.constructor.prototype;
		while (proto) {
			fn(proto);
			proto = proto.__proto__;
		}
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
	 * 遍历对象的所有成员 
	 */
	function $eachMember(o, fn){
		var ar = [];
		for(p in o){ 
			ar.push(o[p]);
		}
		return $each(ar);
	}

	/**
	 * 获取原型链上的成员
	 */
	function $getProtoMember(o, name){
		var proto = o.__proto__ || o.constructor.prototype;
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
	 * 调用父原型的方法
	 */
	function $callBase(o, name, args) {
		if(arguments.length == 1 || $is(Array, name)){
			args = name;
			return $getProtoMember(o, "proto.proto.constructor").apply(o, args);
		}

		var p = $getProtoMember(o, "proto.proto."+name);
		if (typeof p != "function") {
			throw "can't respond to " + '"' + name + '"';
		}
		return p.apply(o, args)
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
		var privateName = "__" + name;
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

	function $upEach(o, name, fn){
		var p = o;
		while(p){
			fn(p);
			p = p[name];
		}
	}


	$property.option = {
		scope: undefined,
		name: undefined, //lowercase
		accessor: "@RW" //upcase @RW
	}

	$global("$each", $each);
	$global("$copy", $copy);
	$global("$makeArray", $makeArray);
	$global("$clone", $clone);
	$global("$like", $like);
	$global("$merge", $merge);
	$global("$option", $option);
	$global("$getAllMembers", $getAllMembers);
	$global("$eachMember", $eachMember);
	$global("$getProtoMember", $getProtoMember);
	$global("$callBase", $callBase);
	$global("$property", $property);
	$global("$upEach", $upEach);
})();

