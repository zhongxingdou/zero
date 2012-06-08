$run(function() {
	eval($global.all);

	var supportProto = {}.__proto__ != undefined;

	var IObject = {
		member: {
			//调用父原型(o.__proto__.__proto__)的方法
			callBase: "function(sName)",
			//mix a module or object
			mix: "function(module)",
			//是否支持某个接口
			isSupported: "function(interface)"
		}
	}

	if(!supportProto){
		IObject.member.__proto__ = "[object]";
	}

	function $Object() {
		if(!supportProto){
			this.__proto__ = arguments.callee.prototype;
		}
	}

	/**
	 * $Object
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	$class($Object, {
		prototype: {
			callBase: function(name, args) {
				return $callBase(this, name, args);
			},
			mix: function(obj) {
				if($is(Module, obj)){
					$include(this, obj);
				}else{
					$copy(obj, this);
				}
				return this;
			},
			isSupported: function(interface){
				return $support(interface, this);
			}
		},
		implementions: IObject
	});

	$global("IObject", IObject);
	$global("$Object", $Object);
});

