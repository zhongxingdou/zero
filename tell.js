$run(function(){
	eval($global.all);

	function $tell(o){
		var wrap = {};
		var p;
		if($is(Array, o)){
			$everyKey(o[0], function(k, fn){
				if($is("function", fn)){
					wrap[k] = $(function(){
						var args = arguments;
						o.forEach(function(item){
							fn.apply(item, args);
						})
					})
				}
			});
		}else{
			$everyKey(o, function(k, v){
				if($is("function", v)){
					wrap[k] = $(v.bind(o));
				}
			});
			return wrap;
		}
	}

	$global("$tell", $tell);
});
