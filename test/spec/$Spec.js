$run(function() {
	eval($global.all);

	describe("$()", function() {
		var name = "@myWp";
		var type = Number;
		var spy = jasmine.createSpy("aw");

		afterEach(function() {
			$.removeWrapper(type, name);
			spy.reset();
		});

		it("注册和获取wrapper", function() {
			$.regWrapper(spy, type, name);
			expect($.getWrapper(type, name)).toBe(spy);
		});

		it("反注册wrapper", function() {
			$.regWrapper(spy, type, name);

			$.removeWrapper(type, name);
			expect($.getWrapper(type, name)).toBeUndefined();
		});

		it("包装值类型", function() {
			var m = {
				onIncluded: spy
			};

			$.regWrapper(m, type, name);
			$(8, name);

			//expect(spy).toHaveBeenCalledWith(8);
			expect(spy).toHaveBeenCalled();
		});

		it("包装引用类型", function() {
			type = Array;
			var m = {
				onIncluded: spy
			};

			$.regWrapper(m, type, name);

			var a = [];
			$(a, name);

			expect(spy).toHaveBeenCalled();
		});

		it("同时包装多个接口", function() {
			type = [Array, String];

			var m = {
				onIncluded: spy
			};

			$.regWrapper(m, type, name);

			var a = [];
			$(a, name);
			expect(spy).toHaveBeenCalled();

			spy.reset();

			var b = new String("");
			$(b, "@myWp");

			expect(spy).toHaveBeenCalled();

			$.removeWrapper(type, name);
			expect($.getWrapper(Array, name)).toBeUndefined();
			expect($.getWrapper(String, name)).toBeUndefined();
		});
	});

	describe("$$()", function(){
		it("$$()包装对象", function(){
			$.regWrapper({
				sayHello: function(){}
			}, Object, "@myWrapper");

			var o = {};
			$$(o, "@myWrapper");

			expect(o.sayHello).toBeDefined();
		});
	});
});

