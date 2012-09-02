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
	 * 类型规格
	 * @class
	 * @param {Object|String|Function} spec 
	 */
	function TypeSpec(spec) {
		this.callBase();

		this.implement(ITypeSpec);

		var t = typeof spec;

		switch(t){
			case "object":
				var thisFn = $thisFn();
				if(spec instanceof thisFn){
					return spec
				}else{
					if(spec !== null){
						var k;
						for(k in spec){
							this[k] = spec[k];
						}
					}
				}
				break;
			case "string":
				this.typeOf = spec;
				break;
			case "function":
				this.instanceOf = spec;
				break;
			case "undefined":
				this.typeOf = t;
				break;
		}
	}

	$$(TypeSpec).toClass().extend(z.Base);

	/**
	 * new $Type()的别名
	 */
	function $spec(typeSpec) {
		return (new TypeSpec(typeSpec));
	}

	/**
	 * 检测对象是否为某种类型
	 * @param{Object|TypeSpec} type 类型规格
	 * @param{Object} o 要检验的对象
	 */
	function $is(type, o) {
		if(type === null)return type === o; // 检查对象是否为null

		//确保type是TypeSpec实例
		if(!(type instanceof TypeSpec)){
			type = $spec(type);
		}

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
				if(!$every(proto, function(aproto){
					return aproto.isPrototypeOf(o);
				}))return false;
			}else{
				if(!proto.isPrototypeOf(o))return false;
			}
		}

		return true;
	}

	z.TypeSpec = TypeSpec;

	z.ITypeSpec = ITypeSpec;

	$global("$spec", $spec);

	$global("$is", $is);
});

