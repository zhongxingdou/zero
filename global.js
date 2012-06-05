(function(host) {
	var IGlobalMenager = {
		type: "function(sNames, o)",
		member: {
			//注册一个变量为全局变量
			set: "function(sName, o)",

			//返回一个全局变量
			get: "function(sName):Object",

			//列举所有的全局变量
			list: "function():Array",

			//返回所有被覆盖的变量
			getOringinMap: "function():Object",

			//恢复覆盖的变量到原来拥有它的对象上
			restore: "function(sName)",

			//复制指定全局变量到某个对象上
			exportTo: "function(saNames, oTarget)",

			//提供一个沙箱运行环境，确保所执行的代码引用到的是被管理的全局变量
			run: "function(fn)",

			//全局变量的默认的复制到目标
			defaultTarget: "object",

			//是否在注册一个全局变量时自动export到defaultTarget
			autoExport: "boolean",

			//删除一个变量脱离global管理，如果它export到了target，从target对象中也删除
			destroy: "function(sName)"
		}
	};




	function GlobalManager(owner, isAutoExport) {
		var o =  owner;
		this.getOwner = function(){
			return o;
		}

		var isAutoExport = isAutoExport === false ?  false : true;

		this.getIsAutoExport = function(){
			return isAutoExport;
		}
		this.setIsAutoExport = function(v){
			isAutoExport = v;
		}

		this.__member = {};
		this.__origin = {};
	}

	GlobalManager.prototype = {
		set: function(sName, o) {
			if (this.get(sName)) {
				this.destroy(sName);
			}

			this.__member[sName] = o;
			if (this.getIsAutoExport()) {
				var owner = this.getOwner();

				var old = owner[sName];
				if (old) {
					this.__origin[sName] = old; 
				}

				owner[sName] = this.get(sName);
			}

			return this;
		},

		get: function(sName) {
			return this.__member[sName];
		},

		list: function() {
			var a = [];
			for (var p in this.__member) {
				a.push(p);
			}
			return a;
		},

		destroy: function(sName) {
			var m = this.get(sName);

			var owner = this.getOwner();
			if(owner[sName] === m){
				try {
					owner[sName] = null;
					delete owner[sName];
				} catch(e) {}
			}
			delete this.__member[sName];
		},

		restore: function(sName) {
			var o = this.__origin[sName];
			if (o) {
				this.getOwner()[sName] = o;
				delete this.__origin[sName];
			}
		},

		getOringinMap: function() {
			return this.__origin;
		},

		/**
		 * 导出指定对象到host对象
		 * @example
		 * exportTo("*", window);
		 * exportTo("$class", window);
		 * exportTo(["$interface", "$module"], window);
		 */
		exportTo: function(sName, oTarget) {
			if (sName === "*") {
				var ms = this.__member;
				var k;
				for (k in ms) {
					oTarget[k] = this.get(k);
				}
			} else {
				if (sName instanceof Array) {
					for (var i = 0, l = sName.length; i < l; i++) {
						var k = sName[i];
						oTarget[k] = this.get(k);
					}
				} else {
					oTarget[sName] = this.get(sName);
				}
			}
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

			fn.apply(host, oList);
		}
	}


	function $global(sName, o) {
		var self = arguments.callee;
		self.set(sName, o);
		return self;
	}

	$global.defaultTarget = host;

	$global.autoExport = true;

	var hostMan = new GlobalManager($global.defaultTarget, $global.autoExport);
	var p;
	for(p in hostMan){
		$global[p] = hostMan[p];
	}
	
	$global("$global", $global);
	$global("GlobalManager", GlobalManager);
})(this);
