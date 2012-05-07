(function(host){
	var IGlobal = {
		type: "function(sNames, o)",
		member: {
			//注册一个变量为全局变量
			set: "function(sName, o)", 

			//返回一个全局变量
			get: "function(sName)",

			//列举所有的全局变量
			getAll: "function",

			//反注册一个全局变量
			unset: "function",

			//返回所有被覆盖的变量
			getOverwrites: "function",

			//恢复覆盖的变量到原来拥有它的对象上
			restore: "function(sName)",

			//复制指定全局变量到某个对象上
			"export": "function(saNames, oTarget)",

			//提供一个沙箱运行环境，确保所执行的代码引用到的是被管理的全局变量
			run: "function(fn)",

			//全局变量的默认的复制到目标
			defaultTarget: "object",

			//是否在注册一个全局变量时自动export到defaultTarget
			autoExport: "boolean"
		}
	};

	var __global__ = {};
	var __origin__ = {};

	function  $global(sName, o){
		var self = arguments.callee;
		self.set(sName, o);
	}

	$global.set = function(sName, o){
		__global__[sName] = {value: o, target: null};
		if(this.autoExport){
			this.__export(sName, this.defaultTarget);
		}
	}

	$global.get = function(sName){
		var o = __global__[sName];
		if(o){
			return o.value;
		}
	}

	$global.list = function(){
		var a = [];
		for(var p in __global__){
			a.push(p);
		}
		return a;
	}

	$global.delete = function(sName){
		var o = __global__[sName];
		if(o && o.target){
			delete o.target[sName];
		}
		delete __global__[sName];
	}

	$global.restore = function(sName){
		var o = __origin__[sName];
		if(o){
			o.target[sName] = o.value;
			delete __origin__[sName];
		}
	}

	$global.getOverwrites = function(){
		return __origin__;
	}

	$global.__export = function(sName, oTarget){
		if(!oTarget)return;
		if(oTarget[sName]){
			__origin__[sName] = {
				value: oTarget[sName],
				target: oTarget
			}
		}

		var o = __global__[sName];
		if(o){
			oTarget[sName] = this.get(sName);
			o.target = oTarget;
		}
	}

	/**
	 * 导出指定对象到host对象
	 * @example
	 * $global.export("*", window);
	 * $global.export("$class", window);
	 * $global.export(["$interface", "$module"], window);
	 */
	$global.export = function(sNames, oTarget){
		if(sName === "*"){
			for(var k in __global__){
				this.__export(sName, oTarget);
			}
		}else{
			if(sName instanceof Array){
				for(var i=0,l=sName.length; i<l;  i++){
					var k =sName[i]; 
					this.__export(k, oTarget);
				}
			}else{
					this.__export(sName, oTarget);
			}
		}
	}

	$global.run = function(fn){
		var aNameList = fn.__args;
		if(!aNameList){
			var ms = fn.toString().match(/\((.*)?\)/);
			if(ms && ms[1]){
				aNameList = ms[1].replace(/ /g, '').split(",");
			}else{
				return fn();
			}
			fn.__args = aNameList; //cache args
		}

		var oList = [];
		for(var i=0,l=aNameList.length; i<l; i++){
			oList.push(this.get(aNameList[i]));
		}

		fn.apply(host, oList);
	}

	var __host__ = null;

	$global.defaultTarget = host;

	$global.autoExport = true;

	host.$global = $global;
})(this);
