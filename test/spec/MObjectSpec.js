$run(function(){
	eval($global.all);

	describe("MObject", function(){
		it("get()", function(){
			var o = {p: {}};
			expect($(o).get).toBeDefined();
			expect($(o).get('p')).toBe(o.p);
		});

		it("set()", function(){
			var o = {};
			expect($(o).set).toBeDefined();

			var p =  {};
			$(o).set('p', p);

			expect(o.p).toBe(p);
		});

		it("invokeFn()调用对象的方法", function(){
			var spy = jasmine.createSpy();
			var o = {method: spy};

			var param = {};
			$(o).invoke("method", [param]);

			expect(spy).toHaveBeenCalledWith(param);
		});

		it("MObject.$()使用一个wrapper扩展对象", function(){
			var o = {};
			var wrapper = $module({method: function(){}});
			var name  = "@mywrap";

			$.regWrapper(wrapper, Object, name);

			var $o = $(o).$(name);

			expect($o.method).toBeDefined();

			expect(o.method).toBeUndefined();

			$.removeWrapper(Object, name);
		});
	});
});
