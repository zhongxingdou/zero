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

	var MModule = {
		onIncluded: function () {
			$implement(IModule, this);
		}
	}

	$.regist(MModule, Object, "toModule");

	//声明自身也是模块
	$$(MModule).toModule();

	z.IObject = IObject;

	z.IModule = IModule;

	z.MModule = MModule;

	function $module(m){
		return $$(m).toModule();	
	}
	$global("$module", $module);
});

