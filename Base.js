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
		getOwnImplns: "function()",
		/**
		* 获取对象及其原型链对象的已实现接口
		*/
		getImplns: "function()"
	}

	/**
	 * Zobject
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function Base() {
	}

    Base.prototype = $implement(IBase, {
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
					z._everyKey(this, function(k){
						if(this[k] == caller){
							funcName = k;
						}
					}, this);
				}


				var protoFn = null;
				z._traceProto(this.proto(), function(proto){
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
			property: function(){
				$property.apply(this, [this].concat(z._slice(arguments)));
				return this;
			},

			getOwnImplns: function(){
				if(this.hasOwnProperty("__implementations__")){
					return this.__implementations__.slice(0);
				}else{
					return [];
				}
			},
			getImplns: function(){
				var ar = this.getOwnImplns();
				z._traceProto(this, function(proto){
					if(proto.hasOwnProperty("__implementations__")){
						var ainterface = proto.__implementations__;
						if(ainterface)ar = ar.concat(ainterface);
					}
				})
				return ar;
			}
	});

	//手动维护到Object的继承关系
	Base.prototype.constructor = Base; 
	Base.baseProto = Object.prototype;

	$class(Base).includeToProto(z.MObject);

	z.IBase = IBase;

	z.Base = Base;
});
