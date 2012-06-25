$run(function(){
	eval($global.all);
	/**
	 * IModule
	 * @interface
	 */
	var IModule = {
		onIncluded: "[function()]",
		mixTo: "[function(toObj)]"
	};

	var __moduleMember = Object.keys(IModule);
	/**
	 * mix一个module到toObjObj
	 * @param {IModule} module 
	 * @param {Object} toObj 
	 */
	function $mix(module, toObj) {
		$everyKey(module, function(k, v){
			if(__moduleMember.indexOf(k) == -1){
				toObj[k] = v;
			}
		});

		if(module.onIncluded){
			module.onIncluded.call(toObj);
		}

		if(module.implns){
			if(!toObj.implns){
				toObj.implns = [].concat(module.implns);
			}else{
				//@todo 去除重复的
				toObj.implns.concat(module.implns);
			}
		}
	}

	function $module(o){
		o.mixTo = function(toObj){
			$mix(o, toObj);
			return o;
		}
		return o;
	}

	$global("IModule", IModule);
	$global("$module", $module);
	$global("$mix", $mix);
});

