/**
 * 定义一个接口对象
 * @param {String} interfaceName
 * @param {Object} base 继承对象
 * @param {define} define
 */
function $interface(interfaceName, base, define){
	var interface;
	var l = arguments.length;
	if(l == 1 && typeof interfaceName == "object"){
		var args = interfaceName;
		interface = {
			define: args.define,
			name: args.name,
			base: args.base
		}
	}else if(l == 2){
		interface = {
			name: interfaceName,
			define: base
		}
	}else if(l == 3){
		interface = {
			name: interfaceName,
			base: base,
			define: define
		}
	}
	this[interfaceName] = interface;
	return interface;
}

/**
 * 接口对象的接口
 */
$interface("IInterface", {
	define: "object",
	name: "string",
	base: "object"
});

/**
 * 判断对象是否实现某个接口
 * @param {Object} obj
 * @param {IInterface} interface
 */
function $support(obj, interface){
	var define = interface.define || interface;
	if(interface.base){
		if(!$support(obj, interface.base))return false;
	}
	for(var p in define){
		if(!(p in obj))return false;
		var itype = define[p];
		if(typeof itype == "string"){
			if(typeof(obj[p]) != itype)return false;
		}else{// type is another interface
			if(!arguments.callee(obj[p], itype))return false;
		}
	}
	return true;
}

/**
 * 定义类定义对象接口
 */
$interface("IClassSpec", {
	$extends: "object",
	$constructor: "function",
	$prototype: "object",
	$statics: "object"
});


/**
 * 定义类对象的接口
 */
$interface({name: "IClass",  base: "function", define:{
		name: "string",
		define: IClassSpec,
		baseProto: "object",
		mixinPrototype: "function"
}});


/**
 * 定义一个类
 * @param {String|Object} className 类名或类
 * @param {IClassSpec} define 类的定义
 * @example
 * $class(className, {
 *		$extends: Base
 *		$constructor: function(){
 *			this.baseCall("constructor"[,args...]);
 *		},
 *		$prototype: {},
 *		$properties: {
 *			property: "rw"
 *		},
 *		$statics: {}
 * }).mixin(Module);
 */
function $class(className, define){
	if(typeof className != "string"){
		return $reopenClass(className, define);
	}

	//if no constructor set then provide normal one.
	var clazz = define.$constructor || function(){ 
		this.constructor.baseProto.constructor.apply(this, $makeArray(arguments));
	};

	var proto = define.$prototype || {};
	proto.constructor = clazz;
	clazz.prototype = proto;

	$copy({from:define.$statics, to:clazz});

	var base = define.$extends;
	if(base){
		$extend(clazz, base);
	}

	clazz.mixinPrototype = function(m){ return $mixin(this.prototype, m);}

	clazz.define = define;

	clazz.name = className;

	this[className] = clazz;

	return clazz;
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
			this.proto = this.constructor.prototype;

			var props = {},
				proto = this.proto;

			while(proto){
				var ps = proto.constructor.define.$properties;
				if(ps){
					$copy({from:ps, to:props});
				}
				proto = proto.constructor.baseProto;
			}

			if(props)this.addProperties(props);
	},
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
		baseCall : function(name){
			var args = $makeArray(arguments, 1);
			var proto;
			if(name === "constructor" || name === "base.constructor"){
				proto = arguments.callee.caller.baseProto;
			}else if(name.indexOf("base.") != -1){
				var uplevel = name.split("base.").length - 1; 
				proto = this.proto;
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

$class("Animal", {
  $extends: $Object,
  $constructor: function(name){
	  this.baseCall("constructor"); 
	  this.name = name;
  },
  $properties: {
	footNumbers: "RW"
  },
  $prototype: {
	sayHello: function(){
		return "Hello, I'm " + this.name;
	}
  }
});

$class("Bird", {
	$extends: Animal,
	$constructor: function(name, color){
		this.baseCall("constructor", name);
		this.color = color;
	},
	$properties: {
		gender: "RW"
	},
	$prototype: {
		fly: function(){
			return "I can fly, I'm a " + this.color + " bird";
		},
		sayHello: function(){
			return this.baseCall("sayHello") + ", and my color is " + this.color; 
		}
	}
});

$class("Poly", {
	$extends: Bird,
	$prototype: {
		sayHello: function(){
			return this.baseCall("base.base.sayHello") + ", and i'm Poly";
		}
	},
	$statics: {
		className: "Poly"
	}
});

function $log(v){
	console.info(v);
}

var dog = new Animal("dog");
$log(dog.sayHello());

var bird = new Bird("bird", "red");
$log(bird.sayHello());
$log(bird.fly());

var apoly = new Poly("poly","green");
$log(apoly.sayHello());

$class(Poly, {
	$statics: {
		reopen: "REOPEN"
	}
});

var p2 = new Poly("new poly", "red");
$log(p2.sayHello());

$log(Poly.reopen);

p2.mixin({"age": 8}).mixin({"bir": "bir"}).mixin({onIncluded: function(c){ $log("mixin" + c.name)}});

Poly.mixinPrototype({"aa": 8})

$log(p2.aa); 

$interface("IAnimal", {
	sayHello: "function"
});

$log("p2 support interface: " + $support(p2, IAnimal));

$interface("IFace",{
	getName: "function",
	setName: "function",
	name: "string"
});

$interface("IInterfaceBase", {
	name: "string",
	getName: "function"
});

$interface("IInterfaceTest", IInterfaceBase, {
	age: "number",
	interest: "object",
	getType: IFace
});

var isSupport = $support({
	getName: new Function(),
	age: 8,
	name: "name",
	interest: ["swimming", "singing", "dancing"],
	getType: {
		getName: new Function(),
		setName: new Function(),
		name: "name"
	}
}, IInterfaceTest);

$log(isSupport);
