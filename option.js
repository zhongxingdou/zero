$run(function() {
	eval($global.all);

	/**
	 * 将以逗号分隔的参数转换成Option，并合并默认参数
	 * 如果你只有一个参数，并且这个参数不是option，而是作为第一个参数，请使用$option({key: value})的形式
	 * @example
	 * function fn(p1, p2){
	 *     var option = $option();
	 *     ....
	 * }
	 * fn.option = $interface(...);
	 */
	function $option(paramap, option) {
		var thisFn = $thisFn(),
		fn = thisFn.caller,
		spec = $interface(option || fn.option),
		member = spec.member,
		args = fn.arguments,
		argc = args.length;

		if (paramap){
			if($support(spec, paramap)){
				return __mergeOption(paramap, member);
			}else{
				throw "arguments invalid";
			}
		}

		paramap = paramap || {};

		var arg0 = args[0];
		if (argc == 1 && typeof arg0 == 'object') {
			if (arg0 instanceof Paramap) {
				paramap = arg0;
			} else {
				var arg0Keys = Object.keys(arg0);
				var deftKeys = Object.keys(member);
				if ($hasSubset(deftKeys, arg0Keys)) { //is paramap
					paramap = arg0;
				} else { //as really args 0
					var key0 = deftKeys[0];
					paramap[key0] = arg0;
				}
			}
		} else {
			var k, i=0;
			for(k in member){
				if(i<argc){
					paramap[k] = args[i];
				}else{
					break;
				}
				i++;
			}
		}

		if($support(spec, paramap)){
			return __mergeOption(paramap, member);
		}else{
			throw "arguments invalid";
		}
	}


	function __mergeOption(option, deft) {
		var k;
		for (k in deft) {
			if (!(k in option)) {
				option[k] = deft[k].value;
			}
		}
		return option;
	}

	function Paramap(hash){
		for(var k in hash){
			this[k] = hash[k];
		}
	}

	function $paramap(hash){
		return new Paramap(hash);
	}


	IOptionSpec = {
		base: ITypeSpec,
		member: {
			value: Object
		}
	}

	function OptionSpec(spec){
		this.callBase();
	}

	function $optionSpec(spec){
		return new Option(spec);
	}

	$class(OptionSpec).extend(TypeSpec);


	$global("$paramap", $paramap);
	$global("Paramap", Paramap);

	$global("$option", $option);
});

