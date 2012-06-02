describe("$class()", function(){
	it("未给定任何参数", function(){
		expect($support(IClass, $class())).toBeTruthy();
	});

	it("define参数为{}", function(){
		expect($support(IClass, $class("TestClass", {}))).toBeTruthy();
	});

	it("未给定define参数", function(){
		expect($support(IClass, $class("TestClass"))).toBeTruthy();
	});

	it("只给定了define参数", function(){
		expect($support(IClass, $class({}))).toBeTruthy();
	});

	it("匿名类", function(){
		var cls = $class(function(){});
		expect($support(IClass, cls)).toBeTruthy();
	});

	it("定义类", function(){
		function TestClass(){};

		var define = {
			properties: {
				name: "@RW"
			},
			prototype: {
				sayHello: function(){}
			}
		};

		$class(TestClass, define);

		expect($support(IClass, TestClass)).toBeTruthy();
		expect($support(IClass, TestClass)).toBeTruthy();

		expect(TestClass.name).toBe("TestClass");
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

	it("子类的实例包含父类原型中的成员", function(){
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

		expect(Clazz.prototype.baseM1).toBe(Base.prototype.baseM1);
		expect(Clazz.prototype.m1).toBe(proto.m1);
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
});
