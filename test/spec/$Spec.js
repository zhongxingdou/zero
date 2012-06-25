$run(function() {
	eval($global.all);

	describe("$()", function() {
		var name = "@myWp";
		var type = "number";
		var spy = jasmine.createSpy("aw");

		afterEach(function() {
			$.unregist(type, name);
			spy.reset();
		});

		it("注册和获取wrapper", function() {
			$.regist(spy, type, name);
			expect($.getWrapper(type, name)).toBe(spy);
		});

		it("反注册wrapper", function() {
			$.regist(spy, type, name);

			$.unregist(type, name);
			expect($.getWrapper(type, name)).toBeUndefined();
		});

		it("包装值类型", function() {
			var m = {
				onIncluded: spy
			}

			$.regist(m, type, name);
			$(8, name);

			//expect(spy).toHaveBeenCalledWith(8);
			expect(spy).toHaveBeenCalled();
		});

		it("包装引用类型", function() {
			type = Array;
			var m = {
				onIncluded: spy
			}

			$.regist(m, type, name);

			var a = [];
			$(a, name);

			expect(spy).toHaveBeenCalled();
		});

		it("同时包装多个接口", function() {
			type = [Array, String];

			var m = {
				onIncluded: spy
			}

			$.regist(m, type, name);

			var a = [];
			$(a, name);
			expect(spy).toHaveBeenCalled();

			spy.reset();

			var b = new String("");
			$(b, "@myWp");

			expect(spy).toHaveBeenCalled();

			$.unregist(type, name);
			expect($.getWrapper(Array, name)).toBeUndefined();
			expect($.getWrapper(String, name)).toBeUndefined();
		});
	});
});

