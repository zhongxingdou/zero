$run(function(){
	eval($global.all);

	var FunctionWraper = $wrapper({
		withAll: function(array){
			return $callWithArray(this, array);
		}
	});

	$.regist(FunctionWraper, Function, "@function");
	$.setDefault(Function, "@function");
});
