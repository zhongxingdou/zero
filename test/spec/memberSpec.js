$run(function() {
	eval($global.all);

	describe("MemberSpec(string)", function() {
		it("以[]声明可选项", function() {
			var spec = new MemberSpec("[string]");
			var pass = spec.check({}, "name");
			expect(pass).toBeTruthy();
		});

		it("以字符串声明类型", function() {
			var spec = new MemberSpec("string");
			var pass = spec.check({ name: "Poly" }, "name");

			expect(pass).toBeTruthy();
		});

		it("Type1|Type2形式的多种类型声明", function() {
			var spec = new MemberSpec("string|number");

			var pass1 = spec.check({ name: "Poly" }, "name");
			expect(pass1).toBeTruthy();

			var pass2 = spec.check({ age: 8 }, "age");
			expect(pass2).toBeTruthy();
		});

		it("[Type1|Type2]形式的多种类型声明", function() {
			var spec = new MemberSpec("[string|number]");

			expect(spec.check({ name: "Poly" }, "name")).toBeTruthy();

			expect(spec.check({ age: 8 }, "age")).toBeTruthy();

			expect(spec.check({ age: new Date() }, "age")).toBeFalsy();

			expect(spec.check({}, "name")).toBeTruthy();
		});
	});

	describe("MemberSpec(object)", function() {
		it("声明required可选项", function() {
			var spec = new MemberSpec({
				type: String,
				required: true
			});

			var pass = spec.check([], "push");

			expect(pass).toBeFalsy();

			var spec = new MemberSpec({
				required: false
			});

			var pass = spec.check({}, "key");
			expect(pass).toBeTruthy();
		});

		it("required为非", function() {
			var spec = new MemberSpec({
				type: String,
				required: true
			});
			expect(spec.check({})).toBeFalsy();
		});

		it("声明type", function() {
			var spec = new MemberSpec({
				type: ["string", "number"]
			});

			expect(spec.check({ name: "Poly" }, "name")).toBeTruthy();

			expect(spec.check({ age: true }, "age")).toBeFalsy();

		});

		it("声明ownProperty", function() {
			var spec = new MemberSpec({
				ownProperty: true
			});

			expect(spec.check({name: "" }, "name")).toBeTruthy();

			expect(spec.check(new String(""), "split")).toBeFalsy();
		});
	});
});

