/**
 * 定义一个接口对象
 * @todo 增加是否出现的选项
 * @param {String} name 接口的名称
 * @param {Object} base 继承对象
 * @param {Object} member 成员 
 * @param {string} type typeof操作目标对象的结果
 */
function $interface(name, base, member, type){
	var interface;
	var l = arguments.length;
	if(l == 1 && typeof name == "object"){
		var args = name;
		interface = {
			member: args.member,
			name: args.name,
			base: args.base,
			type: args.type
		}
	}else if(l == 2){
		interface = {
			name: name,
			member: base
		}
	}else if(l > 3){
		interface = {
			name: name,
			base: base,
			member: member,
			type: type
		}
	}
	this[interface.name] = interface;
	return interface;
}

/**
 * 接口对象的接口
 */
$interface("IInterface", {
	member: "object",
	name: "string",
	base: "object",
	type: "string"
});

/**
 * 判断对象是否实现某个接口
 * @param {Object} obj
 * @param {IInterface} interface
 */
function $support(obj, interface){
	var member = interface.member || interface;
	if(interface.type){
		if(typeof obj != interface.type)return false;
	}
	if(interface.base){
		if(!$support(obj, interface.base))return false;
	}
	for(var p in member){
		var itype = member[p],
			itt = typeof itype,
			exists = p in obj,
			optional = false;

		if(itt == "string" && itype.indexOf("[") == 0){
			optional = true;
			itype = itype.slice(1,-1); //remove []
		}

		if(optional && (!exists || obj[p] == undefined))continue;

		if(!exists)return false;

		if(itt == "string" && typeof(obj[p]) != itype)return false;

		if(itt == "object"){// type is another interface
			if(!arguments.callee(obj[p], itype))return false;
		}
	}
	return true;
}

/**
 * 定义类定义对象接口
 */
$interface("IClassSpec", {
	$extends: "[object]",
	$constructor: "[function]",
	$prototype: "[object]",
	$statics: "[object]"
});


/**
 * 定义类对象的接口
 */
$interface({name: "IClass", type: "function", member:{
		className: "[string]",
		define: IClassSpec,
		baseProto: "[object]",
		mixinPrototype: "function",
}});


/**
 * 定义一个类
 * @param {String|Object} className 类名或类
 * @param {IClassSpec} define 类的定义
 * @example
 * $class(className, {
 *		$extends: $Object,
 *		$constructor: function(){
 *			this.baseCall("constructor"[,args...]);
 *		},
 *		$prototype: {},
 *		$properties: {
 *			property: "rw"
 *		},
 *		$statics: {}
 *		$type: "regular:abstract:singleton"
 * }).mixin(Module);
 *
 * @description
 * 如果超类中不包含$Object，
 * 1.$Object的实例方法baseCall用来调用超类的构造函数
 * 2.继承原型链，但所有超类的构造函数需要手动执行，因为需要
 * 3.属性声明也得不到支持
 */
function $class(className, define){
	var argc = arguments.length;
	if(argc == 1 && typeof className != "string"){ 
		define = className;
		className = undefined;
	}
	if(!define)define = {};

	if(argc == 2 && typeof className != "string"){
		return $reopenClass(className, define);
	}

	//if no constructor set then provide normal one.
	var clazz = define.$constructor || function(){ 
		if(define.$extends){
			return define.$extends.apply(this, $makeArray(arguments));
		}
	};
     	
	var proto = define.$prototype || {};
	proto.constructor = clazz;
	clazz.prototype = proto;

	$copy({from:define.$statics, to:clazz});

	var base = define.$extends;
	if(base)$extend(clazz, base);

	clazz.mixinPrototype = function(m){ return $mixin(this.prototype, m);}

	clazz.define = define;

	clazz.className = className;

	if(className){
		this[className] = clazz;
	}

	return clazz;
}

/**
 * 连接两个对象的属性，当其中一个改变时，更新另一个
 */
function $bindProperty(obj, name, obj2, name2, bidirectional){
	if($support(obj, IEvent)){
		if(!name2)name2 = name;
		var upName2 = name2[0].toUpperCase() + name2.slice(1);
		obj.on(name + "Changed").then($call(obj2, "set" + upName2));
		if(bidirectional){
			$syncProperty(obj2, name2, obj, name);
		}
	}
}


/**
 * 重新打开一个类进行定义
 * @param {IClass} clazz
 * @param {IClassSpec} newDef 
 */
function $reopenClass(clazz, newDef){
		//$statics
		$copy({from:newDef.$statics, to:clazz});
		
		//$prototype
		if(newDef.$prototype){
			clazz.mixinPrototype(newDef.$prototype);
		}

		//$properties
		$copy({from:newDef.$properties, to:clazz.$properties});

		return clazz;
}

/**
 * 让一个类继承另一个类
 * @param {IClass} clazz
 * @param {IClass} base
 */
function $extend(clazz, base){
	var old = clazz.prototype;

	var fn = function(){};
	fn.prototype = base.prototype;
	clazz.prototype = new fn();

	$copy({from:old, to:clazz.prototype});

	clazz.prototype.constructor = clazz;

	clazz.baseProto = base.prototype;
}

/**
 * IModule
 * @interface
 */
$interface("IModule", {
	onIncluded: "function"
});

/**
 * mixin一个module到object
 * @param {Object} object
 * @param {IModule} module 
 */
function $mixin(object, module){
	if(!object || !module)return;
	if(typeof module.onIncluded == "function"){
		module.onIncluded(object);
	}
	$copy({from:module, to:object});
	return object;
}

/**
 * $Object
 * @class
 * @description 对象系统的基础类，建议所有对象都以此类作为超类
 */
$class("$Object", {
	$constructor: function(){
		var props = {}, 
			ps,
			plugins =[],
			plugin;

		this.eachBase(this, function(proto){
			ps = proto.constructor.define.$properties;
			plugin = proto.constructor.define.$plugins;
			if(ps){
				$copy({from:ps, to:props});
			}
			if(plugin){
				Array.prototype.push.apply(plugins, plugin);
			}
		});

		if(props)this.addProperties(props);
		while(plugin=plugins.pop()){
			plugin.call(this);
		}
	},
	$plugins: [function(self){
		console.info("i'm a plugin from $Object");
	}],
	$prototype: {
		addProperties: function(props){
			if(props){
				this.__fields__ = this.__fields__ || {};
				var fields = this.__fields__;
				for(var p in props){
					var rw = props[p].toUpperCase();
					var ap = $makeArray(p);
					var name = ap[0].toUpperCase() + ap.slice(1).join("");
					if(rw.indexOf("R") != -1){
						this["get" + name] = function(){return fields[name];};
					}
					if(rw.indexOf("W") != -1){
						this["set"+ name] = function(value){ fields[name] = value;}
					}
				}
			}
		},
		eachBase: function(self, fn){
			var proto = self.constructor.prototype;
			while(proto){
				fn(proto);
				proto = proto.constructor.baseProto;
			}
		},
		baseCall : function(name){
			var args = $makeArray(arguments, 1);
			var proto;
			if(name === "constructor" || name === "base.constructor"){
				proto = arguments.callee.caller.baseProto;
			}else if(name.indexOf("base.") != -1){
				var uplevel = name.split("base.").length - 1; 
				proto = this.constructor.prototype;
				for(var i=0; i < uplevel && proto; i++){ 
					proto = proto.constructor.baseProto;
				}
				if(proto){ 
					name = name.slice(name.lastIndexOf(".")+1);
				}
			}else{
				proto = this.constructor.baseProto;
			}
			if(proto){
				var member = proto[name];
				if(!member)throw "can't respond to " +'"' + method + '"';
				
				if(typeof member == "function"){
					return member.apply(this, args)
				}else{
					return member;
				}
			}
		},
		mixin: function(module){
			return $mixin(this, module);
		}
	}
});

/**
 * 把集合对象转换成Array
 * @param {Object} obj 被转换的对象
 * @param {Object} start=0 从集合对象中的第几项开始转换 
 */
function $makeArray(obj, start){
	return Array.prototype.slice.apply(obj, [start || 0]);
}

/**
 * copy对象成员到另一个对象
 * @param {Object} from
 * @param {Object} to
 * @param {Boolean} overwrite = true 是否覆盖目标对象已存在的成员
 */
function $copy(args){
	var from = args.from, 
		to =  args.to, 
		overwrite = args.overwrite;

	if(!(from && to))return;

	if(overwrite === false){
		for(var p in from){
			if(!(p in to)){
				to[p] = from[p];
			}
		}
	}else{
		for(var p in from){
			to[p] = from[p];
		}
	}
}

