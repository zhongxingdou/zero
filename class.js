$global.run(function($each, $copy, $makeArray) {
	/**
	 * $class()的define参数的接口
	 */
	var IClassSpec = {
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
			define: "object",
			implements: Array
		}
	};

	/**
	 * 原型继承
	 * @param {IClass} fnClazz
	 * @param {Object} prototype
	 * @description 
	 * 让function的prototype与另一个prototype合并，并设置成员baseProto来引用它。
	 */
	function $extendProto(clazz, baseProto) {
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
	 * @param {Function|String} fnConstructor 构造函数或构造函数的名称
	 * @param {IClassSpec} define 类的定义
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
	function $class(fnConstructor, define) {
		var argc = arguments.length;
		var clazz = fnConstructor;

		//if no constructor set then provide normal one.
		var t = typeof fnConstructor;
		if (t != "function") {
			if (t == "string") {
				var fnName = fnConstructor;
				var code;

				if(define && define.base){
					code = "function " + fnName + "(){ define.base.apply(this, $makeArray(arguments));}";
				}else{
					code = "function " + fnName + "(){}";
				}
				eval(code);

				clazz = eval(fnName);
			} else if (t == "object" || argc == 0) {
				clazz = function() {
					if (define.base) {
						return define.base.apply(this, $makeArray(arguments));
					}
				}
				define = fnConstructor;
			}
		}

		if (!define) define = {};

		var proto = define.prototype || {};
		proto.constructor = clazz;
		clazz.prototype = proto;

		$copy(define.statics, clazz);

		var base = define.base;
		if (base && base.prototype){ 
			$extendProto(clazz, base.prototype);
		}

		clazz.implements = define.implements || [];
		clazz.define = define;

		return clazz;
	}

	/**
	 * 重新打开类
	 * @param {IClassSpec} define 
	 */
	function $reopenClass(clazz, define) {
		//statics
		$copy(define.statics, clazz);
		$copy(define.statics, clazz.define.statics);

		//prototype
		$copy(define.prototype, clazz.prototype);
		$copy(define.prototype, clazz.define.prototype);

		//properties
		$copy(define.properties, clazz.properties);
		$copy(define.properties, clazz.define.properties);

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
	$global("IClassSpec", IClass);
	$global("$class", $class);
	$global("$extendProto", $extendProto);
	$global("$reopenClass", $reopenClass);
	$global("$initProperties", $initProperties);
});
