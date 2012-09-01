$run(function() {
	eval($global.all);

	/**
	 * @interface
	 */
	var IBase = {
		/**
		 * 获取对象的成员
		 * @param {String} name
		 */
		get: "function(name)",
		/**
		 * 设置对象的成员
		 * @param {String} name
		 * @param {Object} value
		 */
		set: "function(name, value)",
		/**
		 * 返回对象的原型，o.__proto__
		 */
		proto: "function",
		/**
		 * 调用父原型(o.__proto__.__proto__)的方法
		 */
		callBase: "function()",
		/**
		 * 包含一个模块
		 * @param {Module} module
		 */
		include: "function(module)",
		/**
		 *定义properties
		 */
		property: "function()",
		/**
		 * 声明实现一个接口,引声明会加入到对象的已实现接口列表中
		 */
		implement: "function(ainterface)",
		/**
		 * 获取对象已经实现的接口
		 */
		getImplns: "function()"
	}

	/**
	 * Zobject
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function Base() {
		//这里是Base的实例的“已实现接口列表”，而不是Base自己的
		this.__implementations__ = [IBase];
	}

	//声明Base这个类对象本身实现IClass接口
	$implement(Base, z.IClass);

    Base.prototype = {
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
						if(this.constructor.prototype === this){
							return this.constructor.baseProto;
						}else{
							return this.constructor.prototype;
						}
					}
				}
			})(), 
			callBase: function() {
				var caller = this.callBase.caller;

				//此处不能用caller.name，因为caller.name可能不是它在对象中的key
				var funcName = (caller == this.constructor) ? "constructor" : undefined; 
				if(!funcName){
					$everyKey(this, function(k){
						if(this[k] == caller){
							funcName = k;
						}
					}, this);
				}


				var protoFn = null;
				$traceProto(this.proto(), function(proto){
					var o = proto[funcName];
					if(o){
						protoFn = o;
						return false; //break;
					}
				});

				if(typeof protoFn == "function"){
					return protoFn.apply(this, arguments);
				}
			},
			include: function(module) {
				$global.get("$include")(module, this);
				return this;
			},
			property: function(){
				$property.apply(this, [this].concat($slice(arguments)));
				return this;
			},
			implement: function(ainterface){
				$implement(this, ainterface);
				return this;
			},
			getImplns: function(){
				return this.__implementations__.slice(0);
			}
	}

	$implement(Base.prototype, IBase);

	//手动维护到Object的继承关系
	Base.prototype.constructor = Base; 
	Base.baseProto = Object.prototype;

	$$(Base).toClass();

	z.IBase = IBase;

	z.Base = Base;
});
