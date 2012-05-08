describe("$is()", function() {
	it("验证typeof声明", function() {
		expect($is("string", "abc")).toBeTruthy();
		expect($is({typeof: "string"}, "abc")).toBeTruthy();

		expect($is("object", {})).toBeTruthy();

		expect($is("function", function() {})).toBeTruthy();
	});

	it("验证签名形式的function声明", function() {
		expect($is("function(p1, p2)", function() {})).toBeTruthy();
	});

	it("验证instanceof声明", function() {
		var fn = function() {};
		expect($is(Function, fn)).toBeTruthy();

		expect($is(Array, [])).toBeTruthy();
	});

	it("验证base声明", function() {
		expect($is({
			base: Object.prototype
		},
		[])).toBeTruthy();
	});

	it("验证多个base声明", function() {
		expect($is({
			base: [Object.prototype, Array.prototype]
		},
		[])).toBeTruthy();
	});

	it("验证function不是'object'而是Object", function() {
		var fn = function(){};
		expect($is("object", fn)).toBeFalsy();
		expect($is(Object, fn)).toBeTruthy();
	});
});

