$run(function() {
	eval($global.all);

	function _setRequiredWithFalse(option){
		var k, a, t;
		for(k in option){
			a = option[k];
			t = typeof a;
			if(t == "object"){
				if(!a.hasOwnProperty["required"]){
					a.required = false;
				}
			}else if(t == "object"){
				option[k] = {
					type: t,
					required: false
				}
			}
		}
		return option;
	}

	/**
	 * 合并参数
	 * @param {Object} params 手动指定对象作为key/value参数，此参数通常从方法参数获取
	 * @param {IInterface} paramSpec 手动指定方法的参数的接口，此参数通过从方法的option属性获取
	 */
	function $option(/*params, paramSpec*/) {
		var args       = arguments,
			realFn     = $fnself().caller,
			params     = args[0] || realFn.arguments[0] || {};

		var option = args[1] || realFn.option;

		option = _setRequiredWithFalse(option);

		var	paramSpec  = $protocol(option);

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

