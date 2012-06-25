$run(function() {
	eval($global.all);

	function __getOptc(fn){
		var opt= fn.option;
		return opt ? Object.keys(opt).length : 0;
	}


	function __makeArgcMap(fns, minimum){
		var argcMap = {};
		fns.forEach(function(fn){
			var optc = __getOptc(fn);
			if(optc >= minimum){
				argcMap[optc] ? argcMap[optc].push(fn) : argcMap[optc] = [fn];
			}
		});
		return argcMap;
	}

	function __optionMatchArgs(option, args){
		var	keys = Object.keys(option),
			i = 0,
			k;

		while(k = keys.shift()){
			var opt_k = option[k];
			var args_i = args[i];

			if(!$is(opt_k, args_i))break;

			i++;
		}

		return args.length == i;
	}

	function $dispatch(fns, args){
		var caller = $dispatch.caller,
			args = args || caller.arguments,
			argc = args.length;

		var argcMap = __makeArgcMap(fns, argc);

		var keys = Object.keys(argcMap);
		if(keys.length){
			keys = keys.sort();

			var k, map_k, fn, opt;

			while(k = keys.shift()){
				map_k = argcMap[k];
				while(fn = map_k.shift()){
					opt = fn.option;
					if(!opt || __optionMatchArgs(opt, args)){
						return fn;
					}
				}
			}
		}
	}

	$global("$dispatch", $dispatch);
});
