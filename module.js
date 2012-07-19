$run(function(){
	eval($global.all);
	/**
	 * IModule
	 * @interface
	 */
	var IModule = {
		onIncluded: "[function()]"
	};

	var __moduleMember = Object.keys(IModule);

	/**
	 * 包含一个module到对象
	 * @param {IModule} module 
	 * @param {Object} toObj 
	 */
	function $include(module, toObj) {
		$everyKey(module, function(k, v){
			if(__moduleMember.indexOf(k) == -1){
				toObj[k] = v;
			}
		});

		if(module.onIncluded){
			module.onIncluded.call(toObj);
		}

		//让调用include的一方来决定是否把module.implns复制过去
		//if(module.implns){
			//if(!toObj.implns){
				//toObj.implns = [].concat(module.implns);
			//}else{
				//@todo 去除重复的
				//toObj.implns.concat(module.implns);
			//}
		//}
	}

	/**
	 * 声明一个模块
	 * @param {Object} o 模块
	 */
	function $module(o){
		return o;
	}

	z.IModule = IModule;

	$global("$module", $module);

	$global("$include", $include);
});

