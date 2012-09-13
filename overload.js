$run(function() {
	eval($global.all);


	function $overload(/*fn1, fn2,{[String, Number]: fn3, [ITypeSpec, String]: fn4]} */){
		var main = function(){
			var args = arguments;
			var fn = _findFuncByParams(args.callee.fnMap, args);
			if(fn){
				return fn.apply(this, arguments);
			}
		}

		main.fnMap = _makeFnMap(arguments);

		main.overload = function(){
			_makeFnMap(arguments, this.fnMap);
		}

		return main;
	}


	var IFuncBox = {
		params: Array,
		fn: Function,
		useOption: Boolean
	}

	/**
	 * 建立一个形参个数对应IFuncBox的map
	 * @return {1: IFuncBox[], 2: IFuncBox[], ... }
	 */
	function _makeFnMap(args, argcToFuncMap){
		argcToFuncMap = argcToFuncMap || {};  //{1: [fnBox1, fnBox2], 2: [fnBox3]}
		var map = map || {};
		var fns = [];

		var a,t,i,l,params;
		for(i=0,l=args.length; i<l; i++){
			a = args[i];
			t = typeof a;
			if(t == "function"){
				if(!a.option)throw "function did not defined option property"
				fns.push({params: [Object], fn: a, useOption: true });
			}else if($is(Array, a)){
				fns.push({params: a[1], fn: a[0], useOption: false});
			}
		}


		var fnBox, count;
		for(i=0,l=fns.length; i<l; i++){
			fnBox = fns[i];
			count = fnBox.params.length;
			if(!argcToFuncMap[count])argcToFuncMap[count] = [];
			argcToFuncMap[count].push(fnBox);
		}

		return argcToFuncMap;
	}

	/**
	 * @param {Object} type 形参的类型声明
	 * @param {Object} param 实参
	 */
	function _matchParamType(type, param){
		var pt = typeof param; //实际参数的类型
		var tt = typeof type; //string: 值类型, function: IClass, object: ITypeSpec

		if(tt !== "string" || type === "object"){//形参声明为引用类型
			if(pt === "object" || pt === "function"){ //实参为引用类型 
				if($is(type, param)){ return true; }
			}else{ //如果实参是值类型,但形参是其值类型对应的引用类型,则也算通过
				var map = {
					"string": String,
					"number": Number,
					"boolean": Boolean
				}
				if(map[pt] === type){ return true; }
			}
		}else{ //形参声明为值类型
			if(pt == tt){ return true; }
		}
		return false;
	}

	/**
	 * 根据实参和[方法形参map]查找出匹配的方法
	 */
	function _findFuncByParams(map, args){
		var fns = map[args.length];
		if(!fns)return;

		var arg0 = args[0];
		var isConfig = args.length == 1 && typeof arg0 === "object";

		var i=0, l, j, k, fnBox, fn, params, option, arg0;
		for(i=0,l=fns.length; i<l; i++){
			fnBox = fns[i];
			fn = fnBox.fn;
			params = fnBox.params;

			if(fnBox.useOption){
				if(isConfig && z._isPlainObject(arg0)){
					option = fn.option;
					var argsCountLessThanOption = z._keys(option).length >= z._keys(arg0).length; 
					if(argsCountLessThanOption && $support(option, arg0)){
						return fn;
					}
				}
				continue;
			}else{
				var isMatched = true;
				for(j=0, k=params.length; j<k; j++){
					isMatched = _matchParamType(params[j], args[j]);
					if(!isMatched)break;
				}
				if(isMatched)return fn;
			}
		}
	}

	$global("$overload", $overload);
});

