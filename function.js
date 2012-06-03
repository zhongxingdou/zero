(function(){
	var FunctionWraper = $wrapper({
		callWithArray: function(array){
			return $callWithArray(this, array);
		},
		bindTo: function(obj){
			var self = this;
			var  fn =  function(){
				return self.apply(obj, $array(arguments));
			}
			return fn;
		}
	});
	$.regist(FunctionWraper, Function);
})();
