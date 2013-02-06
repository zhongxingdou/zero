$run(function() {
	eval($global.all);

	describe("MInspect", function() {
		it("反射简单对象", function() {
			var obj = {
				sayHi: function() {},
				sayHello: function() {},
				__name: 'jim',
				__age: 17,
				scope: 85,
				gender: 'boy',
				__setName: function() {}
			};

			var ro = $inspect(obj);

			expect(ro.publicMethods()).toContain("sayHi");
			expect(ro.publicMethods()).toContain("sayHello");

			expect(ro.privateMethods()).toContain("__setName");

			expect(ro.privateFields()).toContain("__age");
			expect(ro.privateFields()).toContain("__name");

			expect(ro.publicFields()).toContain("scope");
			expect(ro.publicFields()).toContain("gender");

			expect(ro.type()).toBe("object");
			expect(ro.creator()).toBe(Object);
			expect(ro.proto()).toBe(Object.prototype);
			expect(ro.protoLink().length).toBe(1);
		});


		it("反射有父类的对象", function() {
			var Base = function(){};
			Base.prototype = {
				baseName: 'base',
				baseMethod: function(){}
			};

			var Class = function(){};
			Class.prototype = {
				sayHi: function() {},
				sayHello: function() {},
				__name: 'jim',
				__age: 17,
				scope: 85,
				gender: 'boy',
				__setName: function() {}
			};

			$class(Class).extend(Base);

			var ac = new Class();
			ac.myProp = "myProp";

			var ro = $inspect(ac);

			expect(ro.publicMethods()).toContain("sayHi");
			expect(ro.publicMethods()).toContain("sayHello");

			expect(ro.privateMethods()).toContain("__setName");

			expect(ro.privateFields()).toContain("__age");
			expect(ro.privateFields()).toContain("__name");

			expect(ro.publicFields()).toContain("scope");
			expect(ro.publicFields()).toContain("gender");

			expect(ro.type()).toBe("object");
			expect(ro.creator()).toBe(Class);
			expect(ro.proto()).toBe(Class.prototype);

			var link = ro.protoLink();
			expect(link).toContain(Class.prototype);
			expect(link).toContain(Base.prototype);
			expect(link).toContain(Object.prototype);
		});
	});
});
