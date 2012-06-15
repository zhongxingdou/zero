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
			isSupported: "function(interface)",
			//定义properties
			property: "function()"
		}
	}

	if(!supportProto){
		IObject.member.__proto__ = "[object]";
	}

	/**
	 * $Object
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function $Object() {
		if(!supportProto){
			this.__proto__ = arguments.callee.prototype;
		}
	}

    $Object.prototype = {
			proto: function(){
				var proto = this.__proto__ || this.constructor.prototype;
				return proto;
			},
			callBase: function(name, args) {
				return $callBase(this, name, args);
			},
			mix: function(obj) {
				if($is(IModule, obj)){
					$include(this, obj);
				}else{
					$copy(obj, this);
				}
				return this;
			},
			isSupported: function(interface){
				return $support(interface, this);
			},
			/**
			 * @todo return this 还是return Object.definedProperties返回的东西;
			 */
			property: function(){
				$property.apply(this, [this].concat($slice(arguments)));
				return this;
			},
			is: function(spec){
				return $is(spec, this);
			}
	}

	$class($Object).implement(IObject);

	$global("IObject", IObject);
	$global("$Object", $Object);
});

