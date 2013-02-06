$run(function() {
	eval($global.all);

	/**
	 * @protocol
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
		base: "function()",
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
		implement: "function(protocol)",
		/**
		 * 获取对象已经实现的接口
		 */
		getOwnImplns: "function()",
		/**
		 * 获取对象及其原型链对象的已实现接口
		 */
		getImplns: "function()"
	};

	/**
	 * Zobject
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	function Base() {
		// $log("Base callee");
		this.__implns__ = [];
	}

	Base.prototype = $implement(IBase, {
		property: function() {
			$property.apply(this, [this].concat(z._slice(arguments)));
			return this;
		},
		include: function(module) {
			$include(module, this);
			return this;
		},
		get: function(name) {
			return this[name];
		},
		set: function(name, value) {
			this[name] = value;
		},
		proto: (function() {
			var SUPPORT_PROTO = {}.__proto__ != undefined;
			if(SUPPORT_PROTO) {
				return function() {
					return this.__proto__;
				};
			} else {
				return function() {
					if(this.constructor.prototype === this) {
						return this.constructor.baseProto;
					} else {
						return this.constructor.prototype;
					}
				};
			}
		})(),
		base: function() {
			return $base(this, arguments, arguments.callee.caller);
		},
		implement: function(protocol) {
			$implement(protocol, this);
		},
		getOwnImplns: function() {
			if(this.hasOwnProperty("__implns__")) {
				return this.__implns__.slice(0);
			} else {
				return [];
			}
		},
		getImplns: function() {
			var ar = this.getOwnImplns();
			var classImplns = this.constructor.getClassImplns && this.constructor.getClassImplns();
			if(!classImplns){
				classImplns = this.constructor.__class_implns__;
			}
			if(classImplns){
				z._uniqPush(ar, classImplns);
			}
			z._traceProto(this, function(proto) {
				if(proto.hasOwnProperty("__implns__")) {
					var protocol = proto.__implns__;
					if(protocol) ar = ar.concat(protocol);
				}
			});
			return ar;
		}
	});

	//手动维护到Object的继承关系
	Base.prototype.constructor = Base;
	Base.baseProto = Object.prototype;

	$class(Base);

	z.IBase = IBase;

	z.Base = Base;
});