describe("$class()", function(){
	it("创建类无参数", function(){
		expect($support(IClass, $class())).toBeTruthy();
	});

	it("创建类只提供类名称", function(){
		expect($support(IClass, $class("TestClass"))).toBeTruthy();
	});

	it("创建类define参数为{}", function(){
		expect($support(IClass, $class("TestClass", {}))).toBeTruthy();
	});

	it("创建类只有一个参数且这个参数作为define参数", function(){
		var define = {
			prototype: {
				action: 'action'
			}
		}
		var C = $class(define);
		expect(C.prototype.action).toBeDefined();
	});

	it("使用匿名构造函数来创建一个匿名类", function(){
		var cls = $class(function(){});
		expect($support(IClass, cls)).toBeTruthy();
	});

	it("提供完整的参数来创建一个类", function(){
		function TestClass(){};

		var define = {
			statics: {
				instanceCount: 0
			},
			properties: {
				name: "@RW"
			},
			prototype: {
				sayHello: function(){}
			}
		};

		$class(TestClass, define);

		expect($support(IClass, TestClass)).toBeTruthy();

		//expect(TestClass.name).toBe("TestClass");
	});

	it("创建类后构造函数的原有prototype没变",function(){
		function Clazz(){};
		Clazz.prototype = {a1: {}};

		$class(Clazz);

		var a = new Clazz();
		expect(a.a1).toBeDefined();
	});

	it("创建类后构造函数的原有静态成员还在", function(){
		function Clazz(){};
		Clazz.Abc = {a1: {}};
	
		$class(Clazz);
		expect(Clazz.Abc).toBeDefined();
	});

	it("类的原型包含原型声明中的成员", function(){
		function Clazz(){};
		var proto = {
			m1: "m1"
		}
		$class(Clazz, {
			prototype: proto
		});

		expect(Clazz.prototype.m1).toBe(proto.m1);
	});

	it("子类的实例包含父prototype中的成员,父类的prototype是子类实例的原型之一", function(){
		function Base(){};
		$class(Base, {
			prototype: {
				baseM1: {}
			}
		});

		function Clazz(){};
		var proto = {
			m1: "m1"
		}
		$class(Clazz, {
			base: Base,
			prototype: proto
		});

		var  a = new Clazz();

		expect(Clazz.prototype.baseM1).toBe(Base.prototype.baseM1);
		expect(Clazz.prototype.m1).toBe(proto.m1);
		
		
		//父类的prototype是子类实例的原型之一
		expect(Base.prototype.isPrototypeOf(a)).toBeTruthy();
	});

	it("正确附加staitcs到类", function(){
		var statics = {
			init: function(){}
		}

		var Clazz = $class({
			statics: statics
		});

		expect(Clazz.init).toBe(statics.init);
	});

	it("创建的类和它的实例可通过instaceof来验证关系", function(){
		var C = $class();
		var ac = new C();
		expect(ac instanceof C).toBeTruthy();
	});

	it("验证创建类时提供的prototype是类与其实例的prototype",  function(){
		var proto = {};
		var C = $class({prototype: proto});
		var ac = new C();
		expect(proto.isPrototypeOf(ac)).toBeTruthy();
		expect(C.prototype).toBe(proto);

		var fn = function(){};
		var B = $class(fn, {prototype: proto});
		var ab = new C();
		expect(proto.isPrototypeOf(ab)).toBeTruthy();
		expect(B.prototype).toBe(proto);
	});
});
