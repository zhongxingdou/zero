describe("$class()", function(){
	it("未给定任何参数", function(){
		expect($support($class(), IClass)).toBeTruthy();
	});

	it("define参数为{}", function(){
		expect($support($class("TestClass", {}), IClass)).toBeTruthy();
	});

	it("未给定define参数", function(){
		expect($support($class("TestClass"), IClass)).toBeTruthy();
	});

	it("只给定了define参数", function(){
		expect($support($class({}), IClass)).toBeTruthy();
	});

	it("匿名类", function(){
		var cls = $class(function(){});
		expect($support(cls, IClass)).toBeTruthy();
		expect(cls.className).toBe(undefined);
	});

	it("定义类", function(){
		function TestClass(){};
		var define = {
			properties: {
				name: "RW"
			},
			prototype: {
				sayHello: function(){}
			}
		};
		var TestClass = $class(TestClass, define)
		expect($support(TestClass, IClass)).toBeTruthy();
		expect($support(TestClass, IClass)).toBeTruthy();

		expect(TestClass.name).toBe("TestClass");
	});
});
/*
   $class("Animal", {
   $extends: $Object,
   $constructor: function(name){
   this.baseCall("constructor"); 
   this.name = name;
   },
   $plugins: [function(self){
   console.info("i'm a plugin from $Animal");
   }],
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
});
/*
   $class("Animal", {
   $extends: $Object,
   $constructor: function(name){
   this.baseCall("constructor"); 
   this.name = name;
   },
   $plugins: [function(self){
   console.info("i'm a plugin from $Animal");
   }],
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
	age: "[number]",
	interest: "object",
	getType: IFace
});

var isSupport = $support({
	getName: new Function(),
	age: "string",
	name: "name",
	interest: ["swimming", "singing", "dancing"],
	getType: {
		getName: new Function(),
	setName: new Function(),
	name: "name"
	}
}, IInterfaceTest);

$log(isSupport);

$class("TestSingleton", {
	$type: "singleton", 
	$extends: $Object
});

var aTestSingletonInstance = new TestSingleton();
var bTestSingletonInstance = new TestSingleton();
$log("TestSingleton instances a and b are equal: " + (aTestSingletonInstance === bTestSingletonInstance));

$class("SinglePoly",{
},
$extends: Poly,
$type: "singleton"
});

var aSinglePoly = new SinglePoly("aSinglePoly", "blue");
var bSinglePoly = new SinglePoly("bSinglePoly", "red");
$log("SinglePoly instances a and b are equal: " + (aSinglePoly === bSinglePoly));


$class("TestAbstract", {
	$extends: $Object,
	$type: "abstract",
	$constructor: function(){
		this.baseCall("constructor");
		$log("real constructor of TestAbstract callee");
	},
	$prototype: {
		abstract_p: "property from prototype of abstract class"
	}
});

$class("TBaseAbstract", {
	$extends: TestAbstract,
	$constructor: function(){
		this.baseCall("constructor");
	}
});

var baseAbstract = new TBaseAbstract();
$log(baseAbstract.abstract_p);

try{
	new TestAbstract();
}catch(e){
	console.error(e);
}

$class("TAbstract2", {
	$type: "abstract",
	$constructor: function(){
		this.baseCall("constructor");
		$log("real constructor of TAbstract2 callee");
	},
	$extends: TestAbstract,
	$prototype: {
		abstract_p2: "property from prototype of TAbstract2"
	}
});

$class("TBaseAbstract2", {
	$extends: TAbstract2,
	$constructor:function(){}
});

var abstract2 = new TBaseAbstract2();
$log(abstract2.abstract_p2);
*/

