describe("util.js", function() {
	it("$option", function() {
		function fn(p1, p2) {
			var option = $option({
				key1: "key1",
				key2: "key2",
				key3: "key3"
			});

			return option;
		}

		var option = fn("k1", "k2");

		expect(option).toBeDefined();

		expect(option.key1).toBe("k1");
		expect(option.key2).toBe("k2");

		expect(option.key3).toBe("key3");
	});

	it("$copy会复制不存在成员", function(){
		var a = {p1: 'pa'};
		var b = {};

		$copy(a, b);

		expect(b.p1).toBeDefined();
	});

	it("$copy会覆盖已经存在的成员", function(){
		var a = {p1: 'pa'};
		var b = {p1: "pb"};

		$copy(a, b);

		expect(b.p1).toBe("pa");
	});

	it("$merge会复制不存在的成员", function(){
		var a = {p1: 'pa', p2:'p2'};
		var b = {p1: "pb"};

		$merge(a, b);

		expect(b.p2).toBeDefined();
	});

	it("$mergei不会覆盖已经存在的成员", function(){
		var a = {p1: 'pa'};
		var b = {p1: "pb"};

		$merge(a, b);

		expect(b.p1).toBe("pb");
	});

});


