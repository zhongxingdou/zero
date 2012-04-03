describe("$interface()", function(){
	it("以hash包装参数", function(){
		var hArgs = {
			name: "ITest",
			member: {},
			type: "object",
			base: null
		}
		$interface(hArgs);

		expect(ITest).toBeDefined();
		expect(ITest).toEqual(hArgs);
	});


	it("按方法签名提供参数", function(){
		var member = {};
		$interface("ITest", member);

		expect(ITest).toBeDefined();
		expect(ITest.name).toBe("ITest");
		expect(ITest.member).toBe(member);
	});

	afterEach(function(){
		delete ITest;
	});
});
