$global.run(function($each, $copy, $array) {
	/**
	 * $class()的define参数的接口
	 */
	var IClassDefine = {
		member: {
			base: "[object]",
			prototype: "[object]",
			statics: "[object]",
			properties: "[object]",
			implements: Array
		},
		freeze: true
	};

	/**
	 * 定义类对象的接口
	 */
	var IClass = {
		type: "function",
		member: {
			//define: "object",
			//implements: Array
		}
	};

	/**
	 * 原型继承
	 * @param {IClass} fnClazz
	 * @param {Object} prototype
	 * @description 
	 * 让function的prototype与另一个prototype合并，并设置成员baseProto来引用它。
	 */
	function $extend(clazz, baseProto) {
		var old = clazz.prototype;

		var fn = function() {};
		fn.prototype = baseProto;
		clazz.prototype = new fn();

		var proto = clazz.prototype;
		if(old){
			$copy(old, proto);
		}

		proto.constructor = clazz;
		if(!('__proto__' in proto)){
			proto['__proto__'] = baseProto;
		}
	}

	/**
	 * 定义一个类
	 * @param {Function|String} constructor 构造函数或构造函数的名称
	 * @param {IClassDefine} define 类的定义
	 * @example
	 * function Class(){
	 * 			$callBase(this, [args...]);
	 * 			$initProperties(this);
	 * }
	 *
	 * $class(Class, {
	 *		     base: $Object,
	 *		     prototype: {},
	 *		     properties: {
	 *			     property: "@rw"
	 *		     },
	 *		     statics: {}
	 * })
	 *
	 * @description
	 * 如果超类中不包含$Object，
	 * 1.$Object的实例方法baseCall用来调用超类的构造函数
	 * 2.继承原型链，但所有超类的构造函数需要手动执行，因为需要
	 * 3.属性声明也得不到支持
	 */
	function $class(constructor, define) {
		var clazz;

		//if no constructor set then provide normal one.
		var t = typeof constructor;
		if (t != "function") {
			clazz = __makeDefaultConstructor(constructor, define);
		}else{
			clazz = constructor;
		}
		
		if(t == "object"){
			define = constructor;
		}

		if(!clazz)clazz = function(){};
		if(!define)define = {};

		var proto = define.prototype || {};
		proto.constructor = clazz;
		clazz.prototype = proto;

		$copy(define.statics, clazz);

		var base = define.base;
		if (base && base.prototype){ 
			$extend(clazz, base.prototype);
		}

		//clazz.implements = define.implements || [];
		//clazz.define = define;

		return clazz;
	}

	function __makeDefaultConstructor(name, define){
		var fn;
		var t = typeof name;
		if (t == "string") {
			var code;
			if(define && define.base){
				code = "function " + name + "(){ define.base.apply(this, $array(arguments));}";
			}else{
				code = "function " + name + "(){}";
			}
			eval(code);

			fn = eval(name);
		} else if (t == "object") {
			define = name;
			if(define.base){
				fn = function() {
					define.base.apply(this, $array(arguments));
				}
			}
		} 
		return fn;
	}

	/**
	 * 重新打开类
	 * @param {IClassDefine} define 
	 */
	function $reopenClass(clazz, define) {
		//statics
		$copy(define.statics, clazz);
		//$copy(define.statics, clazz.define.statics);

		//prototype
		$copy(define.prototype, clazz.prototype);
		//$copy(define.prototype, clazz.define.prototype);

		//properties
		$copy(define.properties, clazz.properties);
		//$copy(define.properties, clazz.define.properties);

		return clazz;
	}

	/**
	 * 初始化类定义中声明的属性
	 */
	function $initProperties(o){
		var define = o.constructor.define;
		if(define){
			var props = define.properties;
			if(props){
				var name;
				for(name in props){
					$property(o, name, props[name]); 
				}
			}
		}
	}


	$global("IClass", IClass);
	$global("IClassDefine", IClassDefine);
	$global("$class", $class);
	$global("$extend", $extend);
	$global("$reopenClass", $reopenClass);
	$global("$initProperties", $initProperties);
});
