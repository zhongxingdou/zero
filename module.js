$run(function(){
	eval($global.all);
	/**
	 * IModule
	 * @interface
	 */
	var IModule = $interface({
		onIncluded: "[function(toObj, option)]"
	});

	/**
	 * include一个module到toObjObj
	 * @param {IModule} module 
	 * @param {Object} toObj 
	 * @param {Object} option 调用module的oncluded()时传递给它的附加参数
	 */
	function $include(module, toObj, option) {
		if(module.onIncluded){
			$everyKey(module, function(k, v){
				if(k != "onIncluded"){
					toObj[k] = v;
				}
			});

			module.onIncluded(toObj, option);
		}else{
			$copy(module, toObj);
		}

		if(module.implns){
			if(!toObj.implns){
				toObj.implns = [].concat(module.implns);
			}else{
				//@todo 去除重复的
				toObj.implns.catcat(module.implns);
			}
		}
	}

	function $module(o){
		return o;
	}

	$global("IModule", IModule);
	$global("$module", $module);
	$global("$include", $include);
});

