$run(function() {
	eval($global.all);

	describe("$module()", function() {
		it("$module()创建的对象符合IModule接口", function() {
			var m = $module({});
			expect($support(IModule, m)).toBeTruthy();
		});

		it("$mix()", function() {
			var m = $module({
				m1: {},
				m2: {}
			});

			var o = {};
			$mix(m, o);

			expect(o.m1).toBeDefined();
			expect(o.m2).toBeDefined();
		});

		it("$mix()一个模块时会调用它的onIncluded()", function() {
			var spy = jasmine.createSpy();
			var m = $module({
				onIncluded: spy
			});

			var o = {};
			$mix(m, o);
			expect(spy).toHaveBeenCalled();
		});

		it("$mix()时不会把onIncluded()也放进toObj里去了", function(){
			var m = {
				onIncluded: function(){}
			}

			var toObj = {};
			$mix(m, toObj);
			expect(toObj.onIncluded).toBeUndefined();
		});

		/*
		it("$mix()时调用onIncluded()会传递toObj和option", function(){
			var m = {
				onIncluded: jasmine.createSpy()
			}

			var toObj = {};
			var option = {}
			$mix(m, toObj, option);

			expect(m.onIncluded).toHaveBeenCalledWith(toObj, option);
		});
		*/

		it("mixTo(toObj)", function(){
			var m = {method: function(){}};
			$module(m);

			var o = {};
			m.mixTo(o);
			expect(o.method).toBe(m.method);
		});
	});
});

