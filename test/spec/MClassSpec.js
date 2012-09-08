$run(function() {
	eval($global.all);

	describe("$class()", function() {
		it("创建类后构造函数的原有prototype没变", function() {
			function Clazz() {};
			Clazz.prototype = {
				a1: {}
			};

			$class(Clazz);

			var a = new Clazz();
			expect(a.a1).toBeDefined();
		});

		it("创建类后构造函数的原有静态成员还在", function() {
			function Clazz() {};
			Clazz.Abc = {
				a1: {}
			};

			$class(Clazz);
			expect(Clazz.Abc).toBeDefined();
		});

		it("类的原型包含原型声明中的成员", function() {
			function Clazz() {};
			var proto = {
				m1: "m1"
			}
			Clazz.prototype = proto;
			/*$class(Clazz, {
				prototype: proto
			});*/

			expect(Clazz.prototype.m1).toBe(proto.m1);
		});

		it("子类的实例包含父prototype中的成员,父类的prototype是子类实例的原型之一", function() {
			function Base() {};
			Base.prototype = {
					baseM1: {}
			}

			function Clazz() {};
			var proto = {
				m1: "m1"
			}
			Clazz.prototype = proto;
			$class(Clazz).extend(Base);

			var a = new Clazz();

			expect(Clazz.prototype.baseM1).toBe(Base.prototype.baseM1);
			expect(Clazz.prototype.m1).toBe(proto.m1);

			//父类的prototype是子类实例的原型之一
			expect(Base.prototype.isPrototypeOf(a)).toBeTruthy();
		});

		it("创建的类和它的实例可通过instaceof来验证关系", function() {
			var Clazz = function(){};
			$class(Clazz);
			var ac = new Clazz();
			expect(ac instanceof Clazz).toBeTruthy();
		});

		it("验证创建类时提供的prototype是类与其实例的prototype", function() {
			var C = function(){};
			var proto = {};
			C.prototype = proto;

			var ac = new C();
			expect(proto.isPrototypeOf(ac)).toBeTruthy();
			expect(C.prototype).toBe(proto);

			var B = function() {};
			B.prototype = proto; 

			var ab = new C();
			expect(proto.isPrototypeOf(ab)).toBeTruthy();
			expect(B.prototype).toBe(proto);
		});
	});
});
