$run(function() {
	eval($global.all);

	var FunctionWraper = $module({
		"onIncluded": function(fn){
			var name = this.get('name');
			if (name === undefined) {
				name = this.invoke('toString').match(/^function\b\s*([\$\S]*)\s*\(/)[1];
			}
			this.name = name;
		},
		"withAll": function(array) {
			return $every(array, this.target);
		}
	});

	$.regist(FunctionWraper, Function, "@functionWrapper");
	$.setDefault(Function, "@functionWrapper");
});

