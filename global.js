(function(host) {
	var IGlobalMenager = {
		type: "function(names, o)",
		member: {
			//注册一个变量为全局变量
			set: "function(name, o)",

			//返回一个全局变量
			get: "function(name):Object",

			//列举所有的全局变量
			list: "function():Array",

			//返回所有被覆盖的变量
			getOrigin: "function():Object",

			//恢复覆盖的变量到原来拥有它的对象上
			restore: "function(name)",

			//复制指定全局变量到某个对象上
			exportTo: "function(saNames, oTarget)",
			
			//从owner删除导出到它的变量
			destroyExported: "function()",

			//提供一个沙箱运行环境，确保所执行的代码引用到的是被管理的全局变量
			run: "function(fn)",

			//全局变量的默认的复制到目标
			getOwner: "function()",

			//是否在注册一个全局变量时自动export到defaultTarget
			autoExport: "boolean",

			//删除一个变量脱离global管理，如果它export到了target，从target对象中也删除
			destroy: "function(name)",

			getIsAutoExport: "function()",

			setIsAutoExport: "function(v)",

			changeOwner: "function(newOwner)"
		}
	};




	function GlobalManager(owner, isAutoExport) {
		this.__member = {};
		this.__origin = {};
		this.__owner = owner;
	}

	GlobalManager.prototype = {
		getOwner : function(){
			return this.__owner;
		},
		set: function(name, object, autoExport) {
			if (this.get(name)) {
				this.destroy(name);
			}

			this.__member[name] = object;
			if(autoExport !== false){
				var owner = this.getOwner();
				if(owner){
					var old = owner[name];
					if (old) {
						this.__origin[name] = old; 
					}

					owner[name] = this.get(name);
				}
			}
			
			this.all = this.getEvalCode();

			return this;
		},

		get: function(name) {
			return this.__member[name];
		},

		list: function() {
			var a = [];
			for (var p in this.__member) {
				a.push(p);
			}
			return a;
		},

		destroy: function(name) {
			var m = this.get(name);

			var owner = this.getOwner();
			if(owner && owner[name] === m){
				try {
					owner[name] = null;
					delete owner[name];
				} catch(e) {}
			}
			delete this.__member[name];

			this.all = this.getEvalCode();
		},

		restore: function(name) {
			var o = this.__origin[name];
			if (o) {
				var owner = this.getOwner();
				if(!owner)return;

				var now = owner[name];
				if(now === this.get(name) || now == null){ //确保没有被重新赋值
					owner[name] = o;
					delete this.__origin[name];
				}
			}
		},

		getOrigin: function() {
			return this.__origin;
		},

		/**
		 * 导出指定对象到host对象
		 * @example
		 * exportTo("*", window);
		 * exportTo("$class", window);
		 * exportTo(["$interface", "$module"], window);
		 */
		exportTo: function(oTarget, list) {
			var ms = list || this.list(),
				k,
				self = this;

			ms.forEach(function(k){
				oTarget[k] = self.get(k);
			});
		},

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

			var thisOjb = {};
			fn.apply(thisObj, oList);
			return this;
		},
		
		destroyExported: function(){
			var owner = this.getOwner();
			if(!owner)return;

			var list = this.list(),
				key;


			while(key = list.pop()){
				if(owner[key] === this.get(key)){ //确保没有被重新赋值
					try{
						owner[key] = null;
						delete owner[key];
					}catch(e){};
				}
			}
		},

		changeOwner: function(newOwner, needRestore){
			var k;

			this.destroyExported();

			//restore All oringins
			if(needRestore){
				var olds = this.getOrigin();
				for(k in olds){
					this.restore(k);
				}
			}


			this.__origin = {};
			this.__owner = newOwner;


			var ms = this.list();
			var old;
			var originMap = this.__origin;
			while(k = ms.pop()){
				old = newOwner[k];
				if (old) {
					originMap[k] = old; 
				}

				newOwner[k] = this.get(k);
			}
		},

		getEvalCode: function(){
			var list = this.list();
			var code = [];
			list.forEach(function(name){
				code.push(name + "=" + "$global.get('" + name + "')");
			});
			return "var " + code.join(",") + ";";
		}
	}


	function $global(name, o, autoExport) {
		var self = arguments.callee;
		var type = typeof name;
		if(type == "object"){
			for(var k in name){
				self.set(k, name[k], autoExport);
			}
		}else if(type == "string"){
			self.set(name, o, autoExport);
		}
		return self;
	}

	//$global.defaultTarget = host;

	//$global.autoExport = true;

	var hostMan = new GlobalManager();
	var p;
	for(p in hostMan){
		$global[p] = hostMan[p];
	}
	
	//$global("$global", $global, true);
	host.$global = $global;

	$global("GlobalManager", GlobalManager);
})(this);
