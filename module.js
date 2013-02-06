$run(function(){
	eval($global.all);

	/**
	* PObject
	* @protocol
	*/
	var PObject = {
		__implns__: Array
	};

	/**
	 * PModule
	 * @protocol
	 */
	var PModule = {
		onIncluded: "[function()]"
	};


	z.PObject = PObject;

	z.PModule = PModule;

	function $module(m){
		$implement(PModule,m);
		return m;
	}

	$global("$module", $module);
});

