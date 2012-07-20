$run(function() {
	eval($global.all);

	/**
	 * 获取方法的参数数组的个数
	 * @private
	 */
	function __getOptc(fn){
		var opt= fn.option;
		return opt ? Object.keys(opt).length : 0;
	}


	/**
	 * 建立一个参数个数和方法的映射表
	 * @private
	 * @param {Function[]} fns 方法数组
	 * @param {Number} minimum 参数个数的最小值，个数多于此值才进入映射表
	 */
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

	/**
	 * 验证参数是否符合参数接口定义的规格
	 * @private
	 * @param {Interface} option
	 * @param {Object} args arguments
	 * @return Boolean
	 */
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

	/**
	 * 将对象的成员按key出现的顺序装入数组
	 * @private
	 * @param {Object} obj
	 * @return Array
	 */
	function __objToArray(obj){
		var keys = Object.keys(obj);
		var ar = [];
		keys.forEach(function(k){
			ar.push(obj[k]);
		});
		return ar;
	}

	/**
	 * 生成一个可路由一组重载方法的方法
	 * @param {Function[]} fns 方法数组
	 * @return Function
	 */
	function $overwrite(/*fn1, fn2, fn... */){
		var fns = $array(arguments);
		return function(){
			var fn = $dispatch(fns);
			fn && fn.apply(this, arguments);
		}
	}

	/**
	 * 解析参数，如果参数为key/value参数，转换成Array
	 * @private
	 * @param {Function[]} overfns
	 * @param {Object} args arguments
	 */
	function __parseArgs(overfns, args){
		var argc = args.length;
		var a0 = args[0];
		var ArguMap = z.ArguMap;
		//如果认定第一个参数为key/value参数，就转换成数组形式，以方便和参数接口进行比较
		if(argc == 1 && typeof a0 == "object"){
			if(a0 instanceof ArguMap){ 
				args = __objToArray(a0);
			}else{
				//只要第一个参数能够符合重载方法中其中一个的参数接口，就认为第一参数为key/value的参数
				$every(overfns, function(fn){
					var opt = fn.option;
					if(opt && $containsAll(Object.keys(opt), Object.keys(a0))){
						args = __objToArray(a0);
						return false; //break the loop
					}
				});
			}
		}
		return args;
	}

	/**
	 * 根据参数的数量和类型对比方法的参数接口，选择一个方法执行
	 * @param {Function[]} fns 一组方法
	 * @param {Object} args arguments
	 */
	function $dispatch(overfns, args){
		var caller = $thisFn().caller,
			args = __parseArgs(overfns, args || caller.arguments),
			argc = args.length;

		//建立参数个数对方法的映射表
		var argcMap = __makeArgcMap(overfns, argc);

		var argcNums = Object.keys(argcMap);
		if(argcNums.length){
			argcNums = argcNums.sort(); //参数个数从小到大排序

			var count, fns, fn, opt;

			while(count = argcNums.shift()){ //参数个数从小到大取出
				fns = argcMap[count];
				while(fn = fns.shift()){
					opt = fn.option;
					if(!opt || __optionMatchArgs(opt, args)){
						return fn;
					}
				}
			}
		}
	}

	$global("$dispatch", $dispatch);

	$global("$overwrite", $overwrite);
});
