$run(function(){
	eval($global.all);
	/**
	 * IModule
	 * @interface
	 */
	var IModule = $interface({
		onIncluded: "function",
		includes: "object"
	});

	/**
	 * include一个module到object
	 * @param {Object} object
	 * @param {IModule} module 
	 */
	function $include(object, module) {
		if (!object || ! module) return;

		if (typeof module.onIncluded == "function") {
			module.onIncluded(object);
		}

		$copy(module.includes, object);

		return object;
	}

	function $module(o){
		return new Module(o);
	}

	function Module(o){
		if(o && !o.includes && !o.onIncluded){
			o = {includes: o};
		}

		var defaults = {
			onIncluded: function(){},
			includes: {}
		}

		if(o){
			this.onIncluded = o.onIncluded || defaults.onIncluded;
			this.includes = o.includes || defaults.includes;
		}else{
			$copy(defaults, this);
		}
	}

	$class(Module, {base: $Object, implementions: IModule});

	$global("Module", Module);
	$global("IModule", IModule);
	$global("$module", $module);
	$global("$include", $include);
});

