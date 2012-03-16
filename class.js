function $interface(interfaceName, define){
	var interface = {
		define: define,
		name: interfaceName
	}
	this[interfaceName] = interface;
	return interface;
}

function $Support(obj, interface){
	var define = interface.define || interface;
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
function $class(className, classDefine){
	//handle $reopen 
	var origin = classDefine.$reopen;
	if(origin){
		var oldDef = origin.classDefine;
	
	    //copy but don't overwrite
		var list = ["$static", "$properties", "$prototype"];
		for(var i=0,l=list.length; i<l; i++){
			var name = list[i];

			if(!classDefine[name])classDefine[name] = {};
			$copy({from: oldDef[name], to:classDefine[name], overwrite:false});
		}

		//if no set, uses the old classDefine yet.
		if(!classDefine.$constructor)classDefine.$constructor = oldDef.$constructor;
		if(!classDefine.$extends)classDefine.$extends = oldDef.$extends;
	}

	//if no constructor set then provide normal one.
	var clazz = classDefine.$constructor || function(){ 
		this.constructor.baseProto.constructor.apply(this, $makeArray(arguments));
	};

	var proto = classDefine.$prototype || {};
	proto.constructor = clazz;
	clazz.prototype = proto;

	$copy({from:classDefine.$statics, to:clazz});

	var base = classDefine.$extends;
	if(base){
		$extend(clazz, base);
	}

	clazz.mixinPrototype = function(m){ return $mixin(this.prototype, m);}

	clazz.classDefine = classDefine;

	clazz.name = className;

	this[className] = clazz;

	return clazz;
}

function $mixin(object, module){
	if(typeof module.onIncluded == "function"){
		module.onIncluded(object);
	}
	$copy({from:module, to:object});
	return object;
}

function $extend(clazz, base){
	var old = clazz.prototype;

	var fn = function(){};
	fn.prototype = base.prototype;
	clazz.prototype = new fn();

	$copy({from:old, to:clazz.prototype});

	clazz.prototype.constructor = clazz;

	clazz.baseProto = base.prototype;
}

$class("$Object", {
	$constructor: function(){
			this.proto = this.constructor.prototype;

			var props = {},
				proto = this.proto;

			while(proto){
				var ps = proto.constructor.classDefine.$properties;
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

function $makeArray(obj, start){
	return Array.prototype.slice.apply(obj, [start || 0]);
}

/**
 * @param {Object} from
 * @param {Object} to
 * @param {Boolean} overwrite = true
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


var dog = new Animal("dog");
console.info(dog.sayHello());

var bird = new Bird("bird", "red");
console.info(bird.sayHello());
console.info(bird.fly());

var apoly = new Poly("poly","green");
console.info(apoly.sayHello());

$class("Poly2", {
	$reopen: Poly,
	$statics: {
		reopen: "REOPEN"
	}
});

var p2 = new Poly2("new poly", "red");
console.info(p2.sayHello());

console.info(Poly2.reopen);

p2.mixin({"age": 8}).mixin({"bir": "bir"}).mixin({onIncluded: function(c){ console.info("mixin" + c.name)}});

Poly2.mixinPrototype({"aa": 8})

console.info(p2.aa); 

$interface("IAnimal", {
	sayHello: "function"
});

console.info("p2 support interface: " + $Support(p2, IAnimal));

$interface("IFace",{
	getName: "function",
	setName: "function",
	name: "string"
});

$interface("IInterface", {
	getName: "function",
	age: "number",
	name: "string",
	interest: "object",
	getType: IFace
});

var isSupport = $Support({
	getName: new Function(),
	age: 8,
	name: "name",
	interest: ["swimming", "singing", "dancing"],
	getType: {
		getName: new Function(),
		setName: new Function(),
		name: "name"
	}
}, IInterface);

console.info(isSupport);
