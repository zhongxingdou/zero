$run(function() {
	eval($global.all);

	describe("$module()", function() {
		it("$module()创建的对象符合IModule接口", function() {
			var m = $module({});
			expect($support(IModule, m)).toBeTruthy();
		});

		it("$include()", function() {
			var m = $module({
				m1: {},
				m2: {}
			});

			var o = {};
			$include(m, o);

			expect(o.m1).toBeDefined();
			expect(o.m2).toBeDefined();
		});

		it("$include()一个模块时会调用它的onIncluded()", function() {
			var spy = jasmine.createSpy();
			var m = $module({
				onIncluded: spy
			});

			var o = {};
			$include(m, o);
			expect(spy).toHaveBeenCalled();
		});

		it("$include()时不会把onIncluded()也放进toObj里去了", function(){
			var m = {
				onIncluded: function(){}
			}

			var toObj = {};
			$include(m, toObj);
			expect(toObj.onIncluded).toBeUndefined();
		});

		it("$include()时调用onIncluded()会传递toObj和option", function(){
			var m = {
				onIncluded: jasmine.createSpy()
			}

			var toObj = {};
			var option = {}
			$include(m, toObj, option);

			expect(m.onIncluded).toHaveBeenCalledWith(toObj, option);
		});
	});
});

