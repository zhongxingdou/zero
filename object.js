$run(function() {
	eval($global.all);


	var IObject = {
		member: {
			//调用父原型(o.__proto__.__proto__)的方法
			callBase: "function(sName)",
			//mix a module or object
			mix: "function(module)",
			//是否支持某个接口
			support: "function(interface)",
			//定义properties
			property: "function()"
		}
	}

	/**
	 * $Object
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function $Object() {}

    $Object.prototype = {
			get: function(name) {
				return this[name];
			},
			set: function(name, value) {
				this[name] = value;
				return this;
			},
			proto: (function(){
				var SUPPORT_PROTO = {}.__proto__ != undefined;
				if(SUPPORT_PROTO){
					return 	function(){
						return this.__proto__;
					}
				}else{
					return function(){
						return  this.constructor.prototype;
					}
				}
			})(), 
			callBase: function() {
				var caller = this.callBase.caller;

				//此处不能用caller.name，因为caller.name可能不是它在对象中的key
				var fnName = (caller == this.constructor) ? "constructor" : undefined; 
				if(!fnName){
					$everyKey(this, function(k){
						if(this[k] == caller){
							fnName = k;
						}
					}, this);
				}


				var protoFn = null;
				$traceProto(this.proto(), function(proto){
					var o = proto[fnName];
					if(o){
						protoFn = o;
						return false; //break;
					}
				});

				if(typeof protoFn == "function"){
					return protoFn.apply(this, arguments);
				}
			},
			mix: function(module) {
				$global.get("$mix")(module, this);
				return this;
			},
			support: function(interface){
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
			},
			wrap: function(wrapper){
			}
	}

	$class($Object).implement(IObject);

	$global("IObject", IObject);
	$global("$Object", $Object);
});

