$run(function() {
	eval($global.all);

	/**
	 * 将arguments转换成key/value形式的参数，并合并参数的默认值
	 * 如果只有一个参数，且这个参数不是key/value参数，而是作为第一个参数，请使用$option({key: value})的形式
	 * 因为在参数少于两个时，不推荐使用$option
	 * key/value参数，指
	 * @param {Object} argsmap 手动指定对象作为key/value参数，此参数通常从方法参数获取
	 * @param {Object} option 手动指定方法的参数的接口，此参数通过从方法的option属性获取
	 * @example
	 * function fn(p1, p2){
	 *     var option = $option();
	 *     ....
	 * }
	 * fn.option = $interface(...);
	 */
	function $option(/*argsmap, option*/) {
		var thisArgs = arguments,
		argsmap      = thisArgs[0],
		option       = thisArgs[1],
		thisFn       = $thisFn(),
		fn           = thisFn.caller,
		spec         = $interface(option || fn.option),
		member       = spec.member;

		if (argsmap){
			if($support(spec, argsmap)){
				return __mergeOption(argsmap, member);
			}else{
				throw "arguments invalid";
			}
		}

		argsmap = argsmap || {};

		/*var args = fn.arguments,
		argc = args.length,
		arg0 = args[0];
		if (argc == 1 && typeof arg0 == 'object') {
			//if (arg0 instanceof ArgsMap) {//如果第一个参数是一个argsmap，直接认作key/value参数
				argsmap = arg0; //!!!Keep Simple 只有一个参数就认为是argsmap
			} else {
				var arg0Keys = Object.keys(arg0);
				var deftKeys = Object.keys(member);
				if (z._containsAll(deftKeys, arg0Keys)) { //如果方法的接口成员包含第一个参数的所有成员，就将第一个参数作为key/value参数
					argsmap = arg0;
				} else { //作为第一个参数
					var key0 = deftKeys[0];
					argsmap[key0] = arg0;
				}
			}
		} else {//是普通arguments，将它转为argsmap
			var k, i=0;
			for(k in member){
				if(i<argc){
					argsmap[k] = args[i];
				}else{
					break;
				}
				i++;
			}
		}*/

		if($support(spec, argsmap)){
			return __mergeOption(argsmap, member);
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

	/**
	 * key/value参数类
	 * @description 
	 * 通过情况下并不需要将key/value形式的参数实例化成ArgsMap，
	 * 仅在有可能将key/value形式的参数误当作普通参数时强制实例化成ArgsMap
	 */
	 /*
	function ArgsMap(argsMap){
		for(var k in argsMap){
			this[k] = argsMap[k];
		}
	}
	
	$$(ArgsMap).toClass().extend(z.Base);

	function $argu(hash){
		return new ArgsMap(hash);
	}


	z.ArgsMap = ArgsMap;

	$global("$argu", $argu);
	*/

	$global("$option", $option);
});

