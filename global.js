(function(host){
	var IGlobal = {
		type: "function(sNames, o)",
		member: {
			set: "function(sName, o)", 
			get: "function(sName)",
			list: "function",
			delete: "function",
			getOverwrites: "function",
			restore: "function",
			"export": "function(saNames, oTarget)",
			run: "function(fn)"
		},
		$statics: {
			defaultTarget: "object",
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
			aNameList = fn.toString().match(/\((.*)?\)/)[1].replace(/ /g, '').split(",");
			fn.__args = aNameList; //cache args
		}

		var oList = [];
		for(var i=0,l=aNameList.length; i<l; i++){
			oList.push(this.get(aNameList[i]));
		}

		fn.apply({}, oList);
	}

	var __host__ = null;

	$global.defaultTarget = host;

	$global.autoExport = true;

	host.$global = $global;
})(this);
