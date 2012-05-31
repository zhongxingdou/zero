(function() {
	/**
	 * IModule
	 * @interface
	 */
	var IModule = $interface({
		onIncluded: "function",
		includes: "object"
	});

	/**
	 * mixin一个module到object
	 * @param {Object} object
	 * @param {IModule} module 
	 */
	function $mixin(object, module) {
		if (!object || ! module) return;
		if (typeof module.onIncluded == "function") {
			module.onIncluded(object);
		}
		$copy({
			from: module.includes,
			to: object
		});
		return object;
	}

	function $module(o){
		return o;
	}

	$global("IModule", IModule);
	$global("$module", $module);
	$global("$mixin", $mixin);
})();

