(function(host) {
	var IVariableMenager = {
		type: "function(names, o)",
		member: {
			//注册一个变量
			set: "function(name, o)",

			//返回一个变量
			get: "function(name):Object",

			//列举所有的全局变量
			list: "function():Array",

			//导出指定变量到某个对象上
			exportTo: "function(list, target)",
			
			//提供一个沙箱运行环境，确保所执行的代码引用到的是被管理的变量
			run: "function(fn)",

			//删除一个变量
			destroy: "function(name)",

			//一个用于eval(string)方式声明被管理变量的表达式字符串
			all: "string"
		}
	};



	/**
	 * 变量管理类
	 * @constructor
	 * @mixin
	 */
	function VariableManager() {
		this.__member = {};
	}

	VariableManager.prototype = {
		/**
		 * 登记一个变量
		 * @param {String} name 注册名
		 * @param {Object} object 变量
		 */
		set: function(name, object) {
			if (this.get(name)) {
				this.destroy(name);
			}
			this.__member[name] = object;

			this.__onChange();

			return this;
		},

		/**
		 * 注册或者删除一个变量时执行的方法
		 */
		__onChange: function(){
			this.all = this.__getEvalCode();
		},

		/**
		 * 根据名称返回变量
		 * @param {String} name 注册名
		 */
		get: function(name) {
			return this.__member[name];
		},

		/**
		 * 返回所有注册的变量
		 * @return Array
		 */
		list: function() {
			var a = [];
			for (var p in this.__member) {
				a.push(p);
			}
			return a;
		},

		/**
		 * 删除一个变量
		 * @param {String} name 注册名
		 */
		destroy: function(name) {
			if(name in this.__member){
				delete this.__member[name];
				this.__onChange();
			}
		},

		/**
		 * 导出变量到指定对象上
		 * @param {Array|String} list 要导出的变量名称列表
		 * @param {Object} target 导出目标对象
		 *
		 * @example
		 * exportTo(["$interface", "$module"], window);
		 */
		exportTo: function(list, target) {
			if(typeof list == "string"){
				list = [list];
			}

			var ms = list || this.list(),
				k,
				self = this;

			ms.forEach(function(k){
				target[k] = self.get(k);
			});
		},

		/**
		 * 运行指定的方法，并按方法的参数名提取管理的变量作为参数
		 * @param {Function} fn(param1, param2)
		 * !!!注意fn内部不能引用外部局部变量，只能引用全局的
		 *
		 * @example
		 *	var man = new VariableManager();
		 *
		 *	man.set("param1", value1);
		 *	man.set("param2", value2);
		 *
		 *	man.run(function(param1, param2){});
		 */
		run: function(fn) {
			var aNameList = fn.__args;
			if (!aNameList) {
				var ms = fn.toString().match(/\((.*)?\)/);
				if (ms && ms[1]) {
					aNameList = ms[1].replace(/ /g, '').split(",");
				} else {
					aNameList = [];
				}
				fn.__args = aNameList; //cache args
			}

			if (aNameList.length === 0) {
				aNameList = this.list();
				var code = fn.toString();
				var body = code.substr(code.indexOf("{"));

				//fn = eval("(function(" + aNameList.join(",") + ")" + body + ")"); //throw error in ie
				fn = eval("(function(){ return function(" + aNameList.join(",") + ")" + body + "})()"); //throw error in ie
			}

			var oList = [];
			for (var i = 0, l = aNameList.length; i < l; i++) {
				oList.push(this.get(aNameList[i]));
			}

			var thisObj = {};
			fn.apply(thisObj, oList);
			return this;
		},
		
		__getEvalCode: function(){
			var list = this.list();
			var code = [];
			list.forEach(function(name){
				code.push(name + "=" + "$global.get('" + name + "')");
			});
			return "var " + code.join(",") + ";";
		}
	}


	/**
	 * 注册一个变量，$global.set的快捷方式
	 * @global
	 * @mixes VariableManager
	 */
	function $global(name, o) {
		var self = arguments.callee;
		var type = typeof name;
		if(type == "object"){
			for(var k in name){
				self.set(k, name[k]);
			}
		}else if(type == "string"){
			self.set(name, o);
		}
		return self;
	}

	var hostMan = new VariableManager();
	var p;
	for(p in hostMan){
		$global[p] = hostMan[p];
	}
	
	z.VariableManager = VariableManager;

	host.$global = $global;
})(this);
