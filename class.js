$global.run(function($each, $copy, $makeArray) {
	/**
	 * $class()的oDefine参数的接口
	 */
	var IClassSpec = $interface({
		member: {
			base: "[object]",
			prototype: "[object]",
			statics: "[object]",
			properties: "[object]"
		},
		optional: true
	});

	/**
	 * 定义类对象的接口
	 */
	var IClass = $interface({
		type: "function",
		member: {
			baseProto: "[object]"
		}
	});

	/**
	 * 原型继承
	 * @param {IClass} fnClazz
	 * @param {Object} prototype
	 * @description 
	 * 让function的prototype与另一个prototype合并，并设置成员baseProto来引用它。
	 */
	function $extendProto(fnClazz, prototype) {

		var old = clazz.prototype;

		var fn = function() {};
		fn.prototype = prototype;
		clazz.prototype = new fn();

		if(old){
			$copy({
				from: old,
				to: clazz.prototype
			});
		}

		clazz.prototype.constructor = clazz;

		clazz.baseProto = prototype;
	}

	/**
	 * 定义一个类
	 * @param {Function|String} fnConstructor 构造函数或构造函数的名称
	 * @param {IClassSpec} oDefine 类的定义
	 * @example
	 * $class(function Class(){
	 *			this.baseCall("constructor"[,args...]);
	 *		}, {
	 *		     base: $Object,
	 *		     prototype: {},
	 *		     properties: {
	 *			     property: "@rw"
	 *		     },
	 *		     statics: {}
	 *		     type: "regular:abstract:singleton"
	 *      }
	 *  ).mixin(Module);
	 *
	 * @description
	 * 如果超类中不包含$Object，
	 * 1.$Object的实例方法baseCall用来调用超类的构造函数
	 * 2.继承原型链，但所有超类的构造函数需要手动执行，因为需要
	 * 3.属性声明也得不到支持
	 */
	function $class(fnConstructor, oDefine) {
		var argc = arguments.length;
		var clazz = fnConstructor;

		//if no constructor set then provide normal one.
		var t = typeof fnConstructor;
		if (t != "function") {
			if (t == "string") {
				var fnName = fnConstructor;
				var code = "function " + fnName + "(){var base = oDefine.base;if(base)return  base.apply(this, $makeArray(arguments));}";
				eval(code);
				clazz = eval(fnName);
			} else if (t == "object" || argc == 0) {
				clazz = function() {
					if (oDefine.base) {
						return oDefine.base.apply(this, $makeArray(arguments));
					}
				}
				oDefine = fnConstructor;
			}
		}

		if (!oDefine) oDefine = {};

		var proto = oDefine.prototype || {};
		proto.constructor = clazz;
		clazz.prototype = proto;

		$copy({
			from: oDefine.statics,
			to: clazz
		});

		var base = oDefine.base;
		if (base) $extendProto(clazz, base);

		return clazz;
	}

	/**
	 * 重新打开类
	 * @param {IClassSpec} define 
	 */
	function $reopenClass(clazz, define) {
		//statics
		$copy({
			from: define.statics,
			to: clazz
		});

		//prototype
		$copy({
			from: define.prototype,
			to: clazz.prototype
		});

		//properties
		$copy({
			from: define.properties,
			to: clazz.properties
		});

		return clazz;
	}

	$global("IClass", IClass);
	$global("IClassSpec", IClass);
	$global("$class", $class);
	$global("$extendProto", $extendProto);
	$global("$reopenClass", $reopenClass);
});
