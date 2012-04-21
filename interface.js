$global.run(function($each){
	/**
	 * 定义一个接口
	 * @todo .type 支持数组？
	 * @param {String|Object} sName, .name 接口名称
	 * @param {Object} oMember, .member 实现对象应包含的成员
	 * @param {Object} .base 父接口
	 * @param {string} .type typeof操作结果, 可用type1|type2分隔多种类型，可用[type]表可选项
	 * @param {Object|Object[]} .prototype
	 * @param {String|String[]} .ownProperties
	 * @param {Object} .instanceOf
	 */
	/*
	   function $interface(sName, oMember){
	   var interface;
	   var l = arguments.length;
	   if(l == 1 && typeof sName == "object"){
	   interface = sName;
	   }else{
	   interface = {
	   name: sName,
	   member: oMember
	   }
	   }
	   return interface;
	   }*/

	function $interface(oDefine){
		return oDefine;
	}


	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({member: {
		member: "[object]",
		base: "[object]",
		type: "[string]",
		instanceOf: "[object]",
		prototype: "[object]",
		ownProperties: {type: "string", instanceOf: Array, optional: true},
		optional: "[boolean]"
	}});


	/**
	 * 判断对象是否实现某个接口
	 * @param {Object} obj
	 * @param {IInterface} interface
	 */
	function $support(obj, interface, passCheckConstructor){
		if(interface.optional && obj === undefined)return true;

		var base = interface.base;
		if(base && !$support(obj, base, "passCheckConstructor"))return false;

		var type = interface.type;
		if(type && type.match(/^function/))type= "function";

		if(type && typeof(obj) != type)return false;

		//未定义或定义了type为值类型或function（即不为object），则忽略instanceOf验证
		//这表示该对象可为值类型或者引用类型
		if(!passCheckConstructor  &&  (!type || type === "object" )){
			var constructor = interface.instanceOf;
			if(constructor && !(obj instanceof constructor))return false;
		}

		var prototype = interface.prototype;
		if(prototype && !$each(prototype instanceof Array ? prototype : [prototype], function(proto){
			return proto.isPrototypeOf(obj);
		}))return false;

		var props = interface.ownProperties;
		if(props && !$each(props instanceof Array ? props : [props], function(prop){
			return obj.hasOwnProperty(prop);
		}))return false;

		var member = interface.member;
		for(var p in member){
			var typeExp = member[p];
			switch(typeof typeExp){
				case "string":
					fn = $matchType;
					break;
				case "object": //typeExp is another interface
					fn = arguments.callee;
					break;
				default: 
					throw "Expression type error"
			}
			if(!fn(obj[p], typeExp))return false;
		}

		return true;
	}

	/**
	 * 对象的类型是否匹配类型表达式
	 * @param {Object} o
	 * @param {String} sTypeExp
	 */
	function $matchType(o, sTypeExp){
		var optional = sTypeExp.indexOf("[") == 0;

		if(optional && o === undefined) return true;

		if(optional) sTypeExp = sTypeExp.slice(1,-1); //remove []

		var otype = typeof o;
		if(sTypeExp.indexOf("|") != -1){
			var typeList = sTypeExp.split("|");
			for (var i = 0, l=typeList.length; i < l; i++) {
				var ti = typeList[i];
				if(ti.match(/^function/))ti= "function";
				if(otype == ti)return true;
			}
			return false;
		}else if(otype != sTypeExp){
			return false;	
		}

		return true;
	}

	$each(["$interface", "$matchType", "$support", "IInterface"], function(sName){
		$global.set(sName, eval(sName));
	});
});
