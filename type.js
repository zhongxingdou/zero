$run(function() {
	eval($global.all);

	var ITypeSpec;
	
	/**
	 * @class
	 * 类型
	 */
	function TypeSpec(spec) {
		var self = arguments.callee;
		var t = typeof spec;

		if(t == "object"){
			if(spec instanceof self){
				return spec
			}else{
				if(spec !== null){
					var handle = function(key, value){
						if(key in spec){
							this[key] = spec[key];
						}
					}
					$everyKey(ITypeSpec.member, handle, this);
				}
			}
		}else if(t == "string"){
			this.typeOf = spec;
		}else if(t == "function"){
			this.instanceOf = spec;
		}else if(t === "undefined"){
			this.typeOf = t;
		}
	}

	ITypeSpec = {
		member: {
			//是值类型还是引用类型，是哪种值类型
			typeOf: "[string]",

			//是哪个构造函数创建的
			instanceOf: "[object]",

			//原型链中包含哪些原型
			prototypeOf: "[object]" 
		},
		freeze: false
	};


	/**
	 * new $Type()的别名
	 */
	function $spec(typeSpec) {
		return (new TypeSpec(typeSpec));
	}

	/**
	 * 检测对象是否为某种类型
	 * @param{$Type} type 类型
	 * @param{Object} o 要检验的对象
	 */
	function $is(type, o) {
		if(type === null)return type === o;

		if(!(type instanceof TypeSpec)){
			type = $spec(type);
		}

		var t = type.typeOf;
		if(t){
			if(t.indexOf("function") != -1){
				t = "function";
			}
			if(!(typeof(o) === t))return false;
		}

		if (type.instanceOf && !(o instanceof type.instanceOf)) return false;

		var proto = type.prototypeOf;
		if (proto) {
			var b = $callWithAll(function(proto){
				if (!proto.isPrototypeOf(o)) return false;
				return true;
			}, proto);

			if(!b)return false;
		}

		return true;
	}


	$global("ITypeSpec", ITypeSpec);

	//$global("TypeSpec", TypeSpec);

	$global("$spec", $spec);

	$global("$is", $is);
});

