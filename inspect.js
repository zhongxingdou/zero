$run(function() {
	eval($global.all);

	/**
	 * 检视对象
	 * @module
	 */
	var MInspect = $module({
		/**
		 * 返回对象的所有方法
		 */
		methods: function(){
			var keys = this.allKeys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] == "function";
			});
		},
		/**
		 * 返回对象的所有公开方法
		 */
		publicMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return !z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有私有方法
		 */
		privateMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有数据成员
		 */
		fields: function(){
			var keys = this.allKeys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] != "function";
			});
		},
		/**
		 * 返回对象的所有公有数据成员
		 */
		publicFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return !z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的所有私有数据成员
		 */
		privateFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return z._isPrivate(k);
			});
		},
		/**
		 * 返回对象的非原型链上成员的名称
		 */
		keys: function(){
			return Object.keys(this.target);
		},
		/**
		 * 返回对象的所有成员的名称
		 */
		allKeys: function(){
			return z._keys(this.target);
		},
		/**
		 * 返回对象的typeof值
		 */
		type: function(){
			return typeof this.target;
		},
		/**
		 * 返回对象的原型链
		 */
		protoLink: function(){
			var protos = [];
			z._traceProto(this.target, function(p){
				protos.push(p);
			});
			return protos;
		},
		/**
		 * 返回对象的原型
		 */
		proto: function(){
			var t = this.target;
			var supportedProto = {}.__proto__ !== undefined;
			return supportedProto ? t.__proto__ : t.constructor.prototype;
		},
		/**
		 * 返回对象的constructor
		 */
		creator: function(){
			return this.target.constructor;
		},
		/**
		 * 返回对象已实现的接口
		 */
		implns: function(){
			var ar = this.__implementions__;
			return (ar ? [] : ar.slice(0));
		}
	});


	z.MInspect = MInspect;

	$.regist(MInspect, Object, "inspect");

	/**
	 * 检视对象，返回一个包含了MInspect模块的对象
	 * @param {Object} o
	 * @global
	 */
	function $inspect(o){
		return $(o).inspect();
	}

	$global("$inspect", $inspect);
});

