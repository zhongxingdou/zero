$run(function() {
	eval($global.all);

	describe("typeSpec.js", function() {
		it("$is()检验值类型", function() {
			expect($is('string', '')).toBeTruthy();
			expect($is('string', 'abc')).toBeTruthy();

			expect($is('number', 0)).toBeTruthy();
			expect($is('number', 8)).toBeTruthy();
			expect($is('number', - 1)).toBeTruthy();
			expect($is('number', - 1.3)).toBeTruthy();

			expect($is('boolean', true)).toBeTruthy();
			expect($is('boolean', false)).toBeTruthy();
			expect($is('boolean', undefined)).toBeFalsy();

		});

		it("$is()检验引用类型", function() {
			expect($is('function', function() {})).toBeTruthy();
			expect($is(Function, function() {})).toBeTruthy();
			expect($is(Object, function() {})).toBeTruthy();

			expect($is('object', {})).toBeTruthy();
			expect($is(Object, {})).toBeTruthy();

			expect($is(Date, new Date())).toBeTruthy();

			expect($is(RegExp, /abc/)).toBeTruthy();

			expect($is(Array, [])).toBeTruthy();
			expect($is(Object, [])).toBeTruthy();
		});

		it("$is()检验null", function() {
			expect($is('object', null)).toBeTruthy();

			expect($is(null, null)).toBeTruthy();

			expect($is(null, undefined)).toBeFalsy();
			expect($is(null, 8)).toBeFalsy();
			expect($is(null, {})).toBeFalsy();

		});

		it("$is()检验undefined", function() {
			expect($is('undefined', undefined)).toBeTruthy();
			expect($is(undefined, undefined)).toBeTruthy();

			expect($is('undefined', null)).toBeFalsy();

			var a = {};
			expect($is('undefined', a.b)).toBeTruthy();

			function t(a, b) {
				expect($is(undefined, b)).toBeTruthy();
			}
			t(8);
		});

		it("$is()检验带base的type", function() {
			function A() {}

			function B() {}
			B.prototype = new A();
			B.prototype.constructor = B();

			var t = {
				"instanceOf": B,
				"prototypeOf": Object.prototype
			};

			expect($is(t, new B())).toBeTruthy();
		});

		it("$is()检验原型链", function(){
			function A() {}

			function B() {}
			B.prototype = new A();
			B.prototype.constructor = B();

			expect($is({prototypeOf: [B.prototype, Object.prototype]}, new B())).toBeTruthy();

		});

	});
});
