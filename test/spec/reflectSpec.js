$run(function() {
	eval($global.all);

	describe("Object@reflect", function() {
		it("all", function() {
			var obj = {
				sayHi: function() {},
				sayHello: function() {},
				__name: 'jim',
				__age: 17,
				scope: 85,
				gender: 'boy',
				__setName: function() {}
			}

			var ro = $(obj).to("@reflect");

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

	})
});
