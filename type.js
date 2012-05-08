$global.run(function() {
	var IType = {
		member: {
			//是值类型还是引用类型，是哪种值类型
			typeof: "[string]",

			//是哪个构造函数创建的
			instanceof: "[object]",

			//原型链中包含哪些原型
			base: "[object]" 
		},
		freeze: true
	};

	function $Type(typeSpec) {
		return typeSpec
	}

	$Type.parse = function(spec){
		var t = typeof spec;

		if(t == "object"){
			if(spec instanceof $Type){
				return spec
			}else{
				return new $Type(spec);
			}
		}else if(t == "string"){
			spec = {typeof: spec};
		}else if(t == "function"){
			spec = {instanceof: spec};
		}

		return new $Type(spec);
	}

	function $typedef(typeSpec) {
		return $Type.parse(typeSpec);
	}

	function $is(type, o) {
		var type = $typedef(type);

		var t = type.typeof;
		if(t){
			if(t.indexOf("function") != -1){
				t = "function";
			}
			if(!(typeof(o) === t))return false;
		}

		if (type.instanceof && !(o instanceof type.instanceof)) return false;

		var proto = type.base;
		if (proto) {
			if (proto instanceof Array) {
				for (var i = 0, l = proto.length; i < l; i++) {
					if (!proto[i].isPrototypeOf(o)) return false;
				}
			} else {
				if (!proto.isPrototypeOf(o)) return false;
			}
		}

		return true;
	}


	$global("IType", IType);

	$global("$Type", $Type);

	$global("$typedef", $typedef);

	$global("$is", $is);
});

