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
});
