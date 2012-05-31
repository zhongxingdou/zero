describe("$module()", function() {
	it("$module()创建的对象符合IModule接口", function(){
		var m = $module();
		expect($support(IModule, m)).toBeTruthy();
	});

	it("$include()", function(){
		var m = $module({
			m1: {},
			m2: {}
		});

		var o = {};
		$include(o, m);

		expect(o.m1).toBeDefined();
		expect(o.m2).toBeDefined();
	});

	it("$include()一个模块时会调用它的onIncluded()", function(){
		var spy = jasmine.createSpy();
		var m = $module({
			onIncluded: spy
		});

		var o = {};
		$include(o, m);
		expect(spy).toHaveBeenCalled();
	});

});
