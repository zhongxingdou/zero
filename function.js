$run(function(){
	eval($global.all);

	var FunctionWraper = $wrapper({
		withAll: function(array){
			return $every(array, this.target);
		}
	});

	$.regist(FunctionWraper, Function, "@function");
	$.setDefault(Function, "@function");
});
