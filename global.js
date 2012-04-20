__global__ = {};

function  $global(sName, o){
	var self = arguments.callee;
	self.set(sName, o);
}

$global.set = function(sName, o){
	if(arguments.length == 1){
		return __global__[sName];
	}else{
		__global__[sName] = o;
	}
}

$global.get = function(sName){
	return __global__[sName];
}

$global.delete = function(sName){
	delete __global__[sName];
}

/**
 * 导出指定对象到host对象
 * @example
 * $global.export("*", window);
 * $global.export("$class", window);
 * $global.export("$interface", "$module", window);
 */
$global.export = function(sName, oHost){
	if(sName === "*"){
		for(var k in __global__){
			oHost[k] = this.get(k);
		}
	}else{
		if(sName instanceof Array){
			for(var i=0,l=sName.length; i<l;  i++){
				var k =sName[i]; 
				oHost[k] = this.get(k);
			}
		}else{
			return oHost[sName] = this.get(sName);
		}
	}
}
