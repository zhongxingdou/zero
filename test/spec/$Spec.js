describe("$()", function() {
	it("注册和获取wrapper", function() {
		var w = function() {};
		$.regist(w, "number");

		expect($.getWrapper("number")).toBe(w);
	});

	it("反注册wrapper", function() {
		var w = function() {};
		$.regist(w, "number");

		$.unregist("number");
		expect($.getWrapper("number")).toBeUndefined();
	});

	it("包装值类型", function() {
		var aw = jasmine.createSpy("aw");

		$.regist(aw, "number");
		$(8);

		expect(aw).toHaveBeenCalledWith(8);
	});

	it("包装引用类型", function() {
		var aw = jasmine.createSpy("aw");

		$.regist(aw, Array);
		var a = [];
		$(a);

		expect(aw).toHaveBeenCalled();
	});

	it("同时包装多个接口", function() {
		var aw = jasmine.createSpy("aw");

		$.regist(aw, [Array, String]);

		var a = [];
		$(a);
		expect(aw).toHaveBeenCalled();
		aw.reset();

		var b = new String("");
		$(b);
		expect(aw).toHaveBeenCalled();
	});
});
