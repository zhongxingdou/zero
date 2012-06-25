$run(function() {
	eval($global.all);

	describe("function.js", function() {
		it("$(fn).name返回方法的名称", function() {
			function fn() {}
			expect($(fn).name).toBe("fn");
		});

		it("$(anonymous).name返回方法的名称为空字符串", function() {
			var anonymous = function() {};
			expect($(anonymous).name).toBe("");
		});

		it("$(fn).withAll(array)对array逐项作为参数调用fn", function() {
			var fn = jasmine.createSpy();
			var numbers = [1, 2, 3, 4, 5];

			$(fn).withAll(numbers);

			for (var i = 0, l = numbers.length; i < l; i++) {
				expect(fn).toHaveBeenCalledWith(numbers[i]);
			}
		});
	});

});

