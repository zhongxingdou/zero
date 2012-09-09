$run(function() {
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

