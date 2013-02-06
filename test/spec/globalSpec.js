$run(function() {
	eval($global.all);

	describe("z.VariableManager", function() {
		var man;
		var owner;
		beforeEach(function() {
			man = new z.VariableManager();
		});

		it("测试.set()和.get()", function() {
			var a = {};
			man.set('a', a);
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
			expect(man.get('a')).toBeUndefined();
		});

		it(".exportTo()设定到指定对象", function() {
			var k = {};

			var a = {};
			man.set("a", a);

			man.exportTo(['a'], k);
			expect(k.a).toBe(a);
		});

		it(".run()运行一个方法传递签名中指定的变量", function(){
			var o = {
				a: {},
				k: {}
			};

			man.set("a", o.a);
			man.set("k", o.k);

			man.run(function(a, k){
				expect(a).toBe(o.a);
				expect(k).toBe(o.k);
			});
		});

		it(".run()运行一个方法传递所有被管理的变量", function(){
			var o = {
				a: {},
				k: {}
			};

			man.set("a", o.a);
			man.set("k", o.k);

			man.run(function(){
				expect(a).toBeDefined();
				expect(k).toBeDefined();
			});
		});

	});
});

