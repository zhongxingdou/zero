$run(function(){
	eval($global.all);

	/**
	* IObject
	* @protocol
	*/
	var IObject = {
		__implns__: Array
	};

	/**
	 * IModule
	 * @protocol
	 */
	var IModule = {
		onIncluded: "[function()]"
	};


	z.IObject = IObject;

	z.IModule = IModule;

	function $module(m){
		$implement(IModule,m);
		return m;
	}

	$global("$module", $module);
});

