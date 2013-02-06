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
			var method = function(){};
			var m = {
				onIncluded: spy,
				method: method
			};

			$.regWrapper(m, type, name);
			var $8 = $(8, name);

			expect($8.method).toBeDefined();

			//expect(spy).toHaveBeenCalledWith(8);
			expect(spy).toHaveBeenCalled();
		});

		it("包装引用类型", function() {
			var method = function(){};
			type = Array;
			var m = {
				onIncluded: spy,
				method: method
			};

			$.regWrapper(m, type, name);

			var a = [];
			var $a = $(a, name);

			expect($a.method).toBeDefined();
			expect(a.method).toBeUndefined();
			expect(spy).toHaveBeenCalled();
		});

		it("同时包装多个接口", function() {
			var method = function(){};
			type = [Array, String];

			var m = {
				onIncluded: spy,
				method: method
			};

			$.regWrapper(m, type, name);

			var a = [];
			var $a = $(a, name);
			expect(spy).toHaveBeenCalled();
			expect($a.method).toBeDefined();
			expect(a.method).toBeUndefined();

			spy.reset();

			var b = new String("");
			var $b = $(b, "@myWp");

			expect(spy).toHaveBeenCalled();
			expect($b.method).toBeDefined();
			expect(b.method).toBeUndefined();

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

