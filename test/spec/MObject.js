$run(function(){
	eval($global.all);

	describe("ObjectWrapper", function(){
		it("get()", function(){
			var o = {p: {}};
			expect($(o).get).toBeDefined();
			expect($(o).get('p')).toBe(o.p);
		});

		it("set()", function(){
			var o = {};
			expect($(o).set).toBeDefined();

			var p =  {};
			$(o).set('p', p)

			expect(o.p).toBe(p);
		});

		it("invoke()调用对象的方法", function(){
			var spy = jasmine.createSpy();
			var o = {method: spy};

			var param = {};
			$(o).invoke("method", [param]);

			expect(spy).toHaveBeenCalledWith(param);
		});

		it("call()调用对象的方法", function(){
			var spy = jasmine.createSpy();
			var o = {method: spy};
			
			var param = {};
			var thisp = {};
			$(o).call("method", thisp, param);

			expect(spy).toHaveBeenCalledWith(param);
		});

		it("apply()调用对象的方法", function(){
			var spy = jasmine.createSpy();
			var o = {method: spy};
			
			var param = {};
			var thisp = {};
			$(o).apply("method", thisp, [param]);

			expect(spy).toHaveBeenCalledWith(param);
		});

		it("wrap()使用一个wrapper扩展对象", function(){
			var o = {};
			var wrapper = $module({method: function(){}});
			var name  = "@mywrap";

			$.regist(wrapper, Object, name);

			var $o = $(o).wrap(name);

			expect($o.method).toBeDefined();

			$.unregist(Object, name);
		});
	}); 
});
