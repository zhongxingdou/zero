$run(function(){
	eval($global.all);

	/**
	* IObject
	* @interface
	*/
	var IObject = {
		__implns__: Array
	}

	/**
	 * IModule
	 * @interface
	 */
	var IModule = {
		onIncluded: "[function()]"
	}


	z.IObject = IObject;

	z.IModule = IModule;

	function $module(m){
		$implement(IModule,m);
		return m;
	}

	$global("$module", $module);
});

