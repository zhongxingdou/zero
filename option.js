$run(function() {
	eval($global.all);

	/**
	 * 合并参数
	 * @param {Object} params 手动指定对象作为key/value参数，此参数通常从方法参数获取
	 * @param {IInterface} paramSpec 手动指定方法的参数的接口，此参数通过从方法的option属性获取
	 */
	function $option(/*params, paramSpec*/) {
		var args       = arguments,
			realFn     = $fnself().caller,
			params     = args[0] || realFn.arguments[0] || {},
			paramSpec  = $interface(args[1] || realFn.option);

		if($support(paramSpec, params)){
			return __mergeOption(params, paramSpec.member);
		}else{
			throw "arguments invalid";
		}
	}


	function __mergeOption(params, deft) {
		var k;
		for (k in deft) {
			if (!(k in params)) {
				params[k] = deft[k].value;
			}
		}
		return params;
	}


	$global("$option", $option);
});

