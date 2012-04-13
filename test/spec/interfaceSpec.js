describe("$interface()", function(){
	it("参数为配置对象创建接口", function(){
		var hArgs = {
			name: "IFace",
			member: {},
			base: null
		
		}
		var IFace = $interface(hArgs);

		expect(IFace).toBeDefined();
		expect(IFace).toEqual(hArgs);
	});


	it("按方法签名创建接口", function(){
		var member = {};
		var IFace = $interface("IFace", member);

		expect(IFace).toBeDefined();
		expect(IFace.name).toBe("IFace");
		expect(IFace.member).toBe(member);
	});

	afterEach(function(){
		delete IFace;
	});
});

describe("$matchType()", function(){
	it("验证通过", function(){
		expect($matchType(function(){}, "function")).toBeTruthy();
		expect($matchType("abc", "string")).toBeTruthy();
		expect($matchType([], "object")).toBeTruthy();
	});

	it("验证失败！", function(){
		expect($matchType(function(){}, "object")).toBeFalsy();
	});

	it("验证|分隔多个类型", function(){
		var type = "number|string";

		expect($matchType(85, type)).toBeTruthy();
		expect($matchType("A", type)).toBeTruthy();

		expect($matchType(true, type)).toBeFalsy();
	});

	it("验证[type]的形式表示typeof(对象)等于type或undefined", function(){
		var type = "[string]";
		expect($matchType("Lily", type)).toBeTruthy();
	});

	it("验证undefined通过[type]声明", function(){
		var type = "[string]";
		expect($matchType(undefined, type)).toBeTruthy();
	});

	it("验证对象不符合[type]形式的类型声明!", function(){
		var type = "[string]";
		expect($matchType(8, type)).toBeFalsy();
	});

	it("验证类型表达式同时包含|和[]", function(){
		var face = "[number|string]";

		expect($matchType(85, face)).toBeTruthy();
		expect($matchType("A", face)).toBeTruthy();

		expect($matchType(true, face)).toBeFalsy();

		expect($matchType(undefined, face)).toBeTruthy();
	});
});

describe("$support()", function(){
	it("验证对象成员的type声明", function(){
		expect($support(function(){}, {type: "function"})).toBeTruthy();
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

	it("支持以[]的形式表示可选的成员", function(){
		var face = {member: {gender: "[boolean]", name: "string"}};
		expect($support({name: "Lily"}, face)).toBeTruthy();
	});

	it("验证可选的成员不符合类型声明", function(){
		var face = {member: {gender: "[boolean]", name: "string"}};
		expect($support({name: "Lily", gender: "female"}, face)).toBeFalsy();
	});

	it("验证instanceOf声明", function(){
		var face = {instanceOf: Function};
		expect($support(function(){}, face)).toBeTruthy();
	});

	it("忽略父接口的instanceOf声明", function(){
		var face = {base: {instanceOf: Array}, instanceOf: Function};
		expect($support(function(){}, face)).toBeTruthy();
	});

	it("直接忽略instanceOf声明", function(){
		var face = {instanceOf: Function};
		expect($support([], face, "passCheckConsturctor")).toBeTruthy();
	});
});
