describe("$interface()", function(){
	it("参数为配置对象创建接口", function(){
		var hArgs = {
			name: "IFace",
			member: {},
			base: null
		
		}
		$interface(hArgs);

		expect(IFace).toBeDefined();
		expect(IFace).toEqual(hArgs);
	});


	it("按方法签名创建接口", function(){
		var member = {};
		$interface("IFace", member);

		expect(IFace).toBeDefined();
		expect(IFace.name).toBe("IFace");
		expect(IFace.member).toBe(member);
	});

	afterEach(function(){
		delete IFace;
	});
});


describe("$support()", function(){
	it("验证对象的type通过", function(){
		expect($support(function(){}, {type: "function"})).toBeTruthy();
		expect($support("abc", {type: "string"})).toBeTruthy();
		expect($support([], {type: "object"})).toBeTruthy();
	});

	it("验证对象的type失败！", function(){
		expect($support(function(){}, {type: "object"})).toBeFalsy();
	});

	it("验证对象拥有ownProperties声明的成员", function(){
		var aString = new String("hello");
		aString.count = 5;
		expect($support(aString, {ownProperties: "count"})).toBeTruthy();
		//数组形式
		expect($support(aString, {ownProperties: ["count"]})).toBeTruthy();
	});

	it("验证对象拥有ownProperties声明的成员失败！", function(){
		expect($support({}, {ownProperties: ["other"]})).toBeFalsy();
	});

	it("验证接口声明的prototype在对象的原型链中", function(){
		var proto = {};
		var fn = function(){};
		fn.prototype = proto;
		expect($support(new fn(), {prototype: proto})).toBeTruthy();

		//支持以数组形式提供几个prototype
		expect($support(new fn(), {prototype: [proto, Object.prototype]})).toBeTruthy();
	});

	it("验证对象包含成员", function(){
		var obj = {name: "Lily", score: 85, birthday: new Date("1988/3/1")};
		var face = {member: {name: "string", score: "number", birthday: {instanceOf: Date}}};
		expect($support(obj, face)).toBeTruthy();
	});
});
