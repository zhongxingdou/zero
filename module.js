(function() {
	/**
	 * IModule
	 * @interface
	 */
	var IModule = $interface({
		onIncluded: "function"
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
			from: module,
			to: object
		});
		return object;
	}

	$global("IModule", IModule);
	$global("$mixin", $mixin);
})();

