$run(function(){
	eval($global.all);

	/**
	 * 将源对象包装成另一个对象，并且不污染源对象
	 */
	var I$ = {
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
	};


	function $(target, name) {
		var newo = {target: target};

		//copy function member
		$everyKey(target, function(key, value) {
			if(typeof value == "function"){
				newo[key] = value.bind(newo.target);
			}
		});

		//mix wrapper
		//module中this.x＝xx不会设置到target上，要设置到target请使用this.set(x, xx);
		//!!! @todo 考虑要不要给Module.onIncluded方法传递$(target),考虑mix到对象时是否绑定到$(target),避免直接操作target对象
		$.findWrapper(target, name).reverse().forEach(function(wrapper){
			$mix(wrapper, newo);
		}); 

		return newo;
	}


	function $$(o, name){
		$.findWrapper(o, name).reverse().forEach(function(wrapper){
			$mix(wrapper, o);
		});
		return o;
	}

	$.__wrapper = {};

	$.regist = function(wrapper, interface, name) {
		if(name  === "@default")return;

		$callWithAll(function(face){
			var map = this.__wrapper[face];
			if(!map){
				map = this.__wrapper[face] = {"@default": null};
			}

			this.__wrapper[face][name] = wrapper;
		}, interface, $);
	}

	$.setDefault = function(interface, name){
		var wp = this.getWrapper(interface, name);
		if(wp){
			this.__wrapper[interface]["@default"] = wp;
		}
	}

	$.unregist = function(interface, name) {
		if(!(interface && name))return;

		$callWithAll(function(face){
			if(this.__wrapper[face]["@default"] ==  this.getWrapper(face, name)){
				this.setDefault(face, null);
			}
			delete this.__wrapper[face][name];
		}, interface, $);
	}

	$.getWrapper = function(interface, name) {
		name = name || "@default"
		var map = this.__wrapper[interface];
		if(map){
			return map[name];
		}
	}

	$.findWrapper = function(o, name) {
		var type = typeof(o);
		var ws = [];

		if(type === "object" || type === "function"){
			$traceProto(o, function(proto){
				var clazz = proto.constructor;
				var w = $.getWrapper(clazz, name);
				w && ws.push(w);

				if(clazz.implns){
					clazz.implns.each(function(interface){
						w= $.getWrapper(interface, name)
						w && ws.push(w);
					});
				}
			});
		}else{
			ws.push($.getWrapper(type, name));
		}

		return ws;
	}


	/*
	function $wrapper(methods, constructor) {
		var clazz = constructor || function(target){ this.target = target;};
		clazz.prototype = methods;
		return clazz;
	}

	$global("$wrapper", $wrapper);
	*/

	$global("$", $);
	$global("$$", $$);

});
