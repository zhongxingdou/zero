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
	var proto;
		
	var constructor = define.$constructor || function(){ 
		this.constructor.base.apply(this, $makeArray(arguments));
	};

	constructor.prototype = define.$prototype || {};
	constructor.prototype.constructor= constructor;

	$copy(define.$static, constructor);

	constructor.define = define;

	constructor.extend = function(base){
		var self = this;

		var proto = self.prototype;

		var fn = function(){};
		fn.prototype = base.prototype;
		self.prototype = new fn();

		$copy(proto, self.prototype);

		self.prototype.constructor = self;

		self.base = base;

		return self;
	}


	constructor.mixin = function(){
		var self = this;
		return self;
	}

	return constructor;
}

$Object = $class({
	$constructor: function(){
		var props = this.constructor.define.$properties || {};
		var base = this.constructor.base;
		while(base){
			$copy(base.define.$properties, props);
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
		}
	}
});

function $makeArray(obj, start){
	return Array.prototype.slice.apply(obj, [start || 0]);
}

function $copy(from, to){
	for(var p in from){
		to[p] = from[p];
	}
}

Animal = $class({
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
}).extend($Object);

Bird = $class({
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
}).extend(Animal);

Poly = $class({
	$prototype: {
		sayHello: function(){
			return this.baseCall("base.base.sayHello") + ", and i'm Poly";
		}
	},
	$static: {
		className: "Poly"
	}
}).extend(Bird);


var bird = new Bird("bird", "red");
console.info(bird.sayHello());
console.info(bird.fly());

var dog = new Animal("dog");
console.info(dog.sayHello());

var apoly = new Poly("poly","green");
console.info(apoly.sayHello());
/*console.info(dog.fly());*/
