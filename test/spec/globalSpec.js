$run(function() {
	eval($global.all);

	describe("GlobalManager", function() {
		var man;
		var owner;
		beforeEach(function() {
			owner = {};
			man = new GlobalManager(owner);
		});

		it("测试.set()和.get()", function() {
			var a = {};
			man.set('a', a);
			expect(owner.a).toBe(a);
			expect(man.get('a')).toBe(a);
		});

		it(".list()返回所有声明过的对象", function() {
			man.set("n", 8);
			man.set("k", 9);

			var all = man.list();
			expect(all).toContain('n');
			expect(all).toContain('k');
		});

		it(".destroy", function() {
			var a = {};
			man.set("a", a);

			man.destroy('a');
			expect(owner.a).toBeUndefined();
			expect(man.get('a')).toBeUndefined();
		});

		it(".restore()恢复变量到原来拥有它的对象上", function() {
			var old = {};
			owner.a = old;

			var b = {};
			man.set('a', b);

			expect(owner.a).toBe(b);

			man.restore('a');

			expect(owner.a).toBe(old);

			expect(man.get('a')).toBe(b);
		});

		it(".exportTo()设定到指定对象", function() {
			var k = {};

			var a = {};
			man.set("a", a);

			man.exportTo(k);
			expect(k.a).toBe(a);
		});
	});
});

