$global.run(function(){
	/**
	 * 将源对象包装成另一个对象，并且不污染源对象
	 */
	var I$ = $interface({
		type: "function",
		member: {
			//注册一个wrapper
			regist: "function(wrapper, interface)",

			//反注册一个wrapper
			unregist: "function(wraper, interface)",

			//根据interface获取一个wrapper
			getWrapper: "function(interface)",

			//查找对象的wrapper
			findWrapper: "function(o)"
		}
	});


	function $(o) {
		var ws = $.findWrapper(o), 
			newo = {},
			w;

		if(ws.length == 1){
			newo = new ws[0](o);
		}else{
			while (w = ws.pop()) {
				$copy((new w(o)), newo);
			}
		}

		return newo;
	}

	$.__wrapper = {};

	$.regist = function(wrapper, interface) {
		$callWithArray(function(face){
			this.__wrapper[face] = wrapper;
		}, interface, $);
	}

	$.unregist = function(interface) {
		delete this.__wrapper[interface];
	}

	$.getWrapper = function(interface) {
		return this.__wrapper[interface];
	}

	$.findWrapper = function(o) {
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			$traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz);
				w && ws.push(w);

				$each(clazz.implementions, function(interface){
					w= $.getWrapper(interface)
					w && ws.push(w);
				});
			});
		}else{
			ws.push($.getWrapper(type));
		}

		return ws;
	}

	$global("$", $);
});
