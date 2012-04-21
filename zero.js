/*require("./global.js");*/

/*require("util");*/

/*require("./interface.js");*/

/*require("module");*/

/*require("class");*/

/*require("object");*/


/**
 * 连接两个对象的属性，当其中一个改变时，更新另一个
 */
function $bindProperty(obj, name, obj2, name2, bidirectional){
	if($support(obj, IEvent)){
		if(!name2)name2 = name;
		var upName2 = name2.slice(0,1).toUpperCase() + name2.slice(1);
		obj.on(name + "Changed").then($call(obj2, "set" + upName2));
		if(bidirectional){
			$syncProperty(obj2, name2, obj, name);
		}
	}
}
