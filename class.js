/**
 * @example
 * $class({
 *		$constructor: function(){
 *			this.baseCall("constructor"[,args...]);
 *		},
 *		$prototype: {},
 *		$properties: {
 *			property: "rw"
 *		},
 *		$static: {}
 * }).extends(SuperClass).mixin(Module);
 *
 *
 */
function $class(define){
	//handle $reopen 
	var origin = define.$reopen;
	if(origin){
		var oldDef = origin.define;
	
	    //copy but don't overwrite
		var list = ["$static", "$static", "$prototype"];
		for(var i=0,l=list.length; i<l; i++){
			var name = list[i];

			if(!define[name])define[name] = {};
			$copy({from: oldDef[name], to:define[name], overwrite:false});
		}

		//if no set, uses the old define yet.
		if(!define.$constructor)define.$constructor = oldDef.$constructor;
		if(!define.$extends)define.$extends = oldDef.$extends;
	}

	//if no constructor set then provide normal one.
	var clazz = define.$constructor || function(){ 
		this.constructor.base.apply(this, $makeArray(arguments));
	};

	var proto = define.$prototype || {};
	proto.constructor = clazz;
	clazz.prototype = proto;

	$copy({from:define.$static, to:clazz});

	var base = define.$extends;
	if(base){
		$extend(clazz, base);
	}

	clazz.mixinPrototype = function(m){ return $mixin(this.prototype, m);}

	clazz.define = define;

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

	clazz.base = base;
}

$Object = $class({
	$constructor: function(){
		var props = this.constructor.define.$properties || {};
		var base = this.constructor.base;
		while(base){
			$copy({from:base.define.$properties, to:props});
			base = base.base;
		}
		this.addProperties(props);
	},
	$prototype: {
		addProperties: function(props){
			if(props){
				this.__fields = this.__fields || {};
				for(var p in props){
					var rw = props[p].toUpperCase();
					var name = p[0].toUpperCase() + p.slice(1);
					if(rw.indexOf("R") != -1){
						this["get" + name] = function(){return this.__fields[name];};
					}
					if(rw.indexOf("W") != -1){
						this["set"+ name] = function(value){ this.__fields[name] = value;}
					}
				}
			}
		},
		baseCall : function(name){
			var args = $makeArray(arguments, 1);
			var proto;
			if(name === "constructor"){
				proto = arguments.callee.caller.base.prototype;
			}else if(name.indexOf("base.") != -1){
				var uplevel = name.split("base.").length - 1; 
				var base = this.constructor.base;
				for(var i=1; i < uplevel && base; i++){ 
					base = base.base;
				}
				if(base){ 
					proto = base.prototype;
					name = name.slice(name.lastIndexOf(".")+1);
				}
			}else{
				proto = this.constructor.base.prototype;
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

Animal = $class({
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

Bird = $class({
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
			return this.baseCall("base.sayHello") + ", and my color is " + this.color; 
		}
	}
});

Poly = $class({
	$extends: Bird,
	$prototype: {
		sayHello: function(){
			return this.baseCall("base.base.sayHello") + ", and i'm Poly";
		}
	},
	$static: {
		className: "Poly"
	}
});


var bird = new Bird("bird", "red");
console.info(bird.sayHello());
console.info(bird.fly());

var dog = new Animal("dog");
console.info(dog.sayHello());
/*console.info(dog.fly());*/

var apoly = new Poly("poly","green");
console.info(apoly.sayHello());

Poly = $class({
	$reopen: Poly,
	$static: {
		reopen: "REOPEN"
	}
});

var p2 = new Poly("new poly", "red");
console.info(p2.sayHello());

console.info(Poly.reopen);

p2.mixin({"age": 8}).mixin({"bir": "bir"}).mixin({onIncluded: function(c){ console.info("mixin" + c.name)}});

Poly.mixinPrototype({"aa": 8})

console.info(p2.aa); 
