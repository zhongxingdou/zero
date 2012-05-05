describe("$()", function() {
	it("注册和获取wrapper", function() {
		var w = function(){};
		$.regist("number", w);

		expect($.getWrapper("number")).toBe(w);
	});

	it("反注册wrapper", function() {
		var w = function(){};
		$.regist("number", w);

		$.unregist("number");
		expect($.getWrapper("number")).toBeUndefined();
	});

	it("包装值类型", function() {
		var aw = jasmine.createSpy("aw");

		$.regist("number", aw);
		$(8);

		expect(aw).toHaveBeenCalledWith(8);
	});

	it("包装引用类型", function(){
		var aw = jasmine.createSpy("aw");

		$.regist(Array, aw);
		var a= [];
		$(a);

		expect(aw).toHaveBeenCalled();
	});
});

