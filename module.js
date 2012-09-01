$run(function(){
	eval($global.all);

	/**
	* IObject
	* @interface
	*/
	var IObject = {
		__implementations__: Array
	}

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

		//只给包含__implementations__成员的对象加入模块实现的接口
		var definedImplns = toObj.__implementations__ != null;
		if(definedImplns){
			var ainterface = module.getImplns ? module.getImplns() : module.__implementations__;
			if(ainterface){
				$implement(toObj, ainterface);
			}
		}
	}

	var MModule = {
		onIncluded: function () {
			$implement(this, [IObject, IModule]);
		}
	}

	$.regist(MModule, Object, "toModule");

	z.IObject = IObject;

	z.IModule = IModule;

	z.MModule = MModule;

	$global("$include", $include);
});

