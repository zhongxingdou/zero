describe("type.js", function(){
	it("$typedef(string)", function(){
		var string = "object";
		var type = $typedef(string);
		expect(type.typeof).toBeDefined();
		expect(type.typeof).toBe(string);
	});

	it("$typedef(fn)", function(){
		var fn = function(){};
		var type = $typedef(fn);
		expect(type.instanceof).toBeDefined();
		expect(type.instanceof).toBe(fn);
	});

	it("$typdef(o)", function(){
		var o = {name: 'hello', typeof: 'string'};
		var type = $typedef(o);
		expect($support(IType, type));
		expect(type.name).toBeUndefined();
		expect(type.typeof).toBe('string');
	});

	it("$is()检验值类型", function(){
		expect($is('string', '')).toBeTruthy();
		expect($is('string', 'abc')).toBeTruthy();

		expect($is('number', 0)).toBeTruthy();
		expect($is('number', 8)).toBeTruthy();
		expect($is('number', -1)).toBeTruthy();
		expect($is('number', -1.3)).toBeTruthy();

		expect($is('boolean', true)).toBeTruthy();
		expect($is('boolean', false)).toBeTruthy();
		expect($is('boolean', undefined)).toBeFalsy();

		});

	it("$is()检验引用类型", function(){
		expect($is('function', function(){})).toBeTruthy();
		expect($is(Function, function(){})).toBeTruthy();
		expect($is(Object, function(){})).toBeTruthy();

		expect($is('object', {})).toBeTruthy();
		expect($is(Object, {})).toBeTruthy();

		expect($is(Date, new Date)).toBeTruthy();

		expect($is(RegExp, /abc/)).toBeTruthy();

		expect($is(Array, [])).toBeTruthy();
		expect($is(Object, [])).toBeTruthy();
	});


	it("$is()检验null", function(){
		expect($is('object', null)).toBeTruthy();

		expect($is(null, null)).toBeTruthy();

		expect($is(null, undefined)).toBeFalsy();
		expect($is(null, 8)).toBeFalsy();
		expect($is(null, {})).toBeFalsy();

	});

	it("$is()检验undefined", function(){
		expect($is('undefined', undefined)).toBeTruthy();
		expect($is(undefined, undefined)).toBeTruthy();

		expect($is('undefined', null)).toBeFalsy();

		var a = {};
		expect($is('undefined', a.b)).toBeTruthy();

		function t(a, b){
			expect($is(undefined,  b)).toBeTruthy();
		}
		t(8);
	});
});
