$run(function() {
	eval($global.all);

	describe("util.js", function() {
		it("z._every将在处理函数返回false时中断", function() {
			var i;
			z._every([1, 2, 3], function(n) {
				i = n;
				if (n === 2) return false;
			});
			expect(i).toBe(2);
		});

		it("z._every遍历完数组时返回true", function() {
			var b = z._every([1, 2, 3], function(n) {});
			expect(b).toBe(true);
		});

		it("z._everyKey", function() {
			var o = {
				key1: "key1",
				key2: "key2"
			};

			var keys = [];
			var values = [];
			z._everyKey(o, function(key, v) {
				keys.push(key);
				values.push(v);
			});

			expect(keys).toContain("key1");
			expect(keys).toContain("key2");

			expect(values).toContain("key1");
			expect(values).toContain("key2");
		});

		it("z._everyKey()如果处理函数返回false将中断遍历", function() {
			var o = {
				key1: "key1",
				key2: "key2",
				key3: "key3"
			};

			var keys = [];
			var values = [];
			z._everyKey(o, function(key, v) {
				keys.push(key);
				values.push(v);
				if (key === "key2") return false;
			});

			expect(keys).toNotContain("key3");
			expect(values).toNotContain("key3");
		});

		it("$trace", function() {
			var a = {
				name: 'a'
			};
			var b = {
				name: 'b',
				parent: a
			};
			var c = {
				name: 'c',
				parent: b
			};
			var names = [];
			$trace(c, 'parent', function(item) {
				names.push(item.name);
			});

			var exp = expect(names);
			exp.toContain('a');
			exp.toContain('b');
			exp.toContain('c');
		});

		it("z._traceProto", function() {
			function A() {}
			A.prototype = {
				a1: {}
			};

			function B() {}
			B.prototype.b1 = {};
			$extend(B, A);

			var b = new B();
			var ms = [];
			z._traceProto(b, function(proto) {
				ms.push(proto);
			});

			expect(ms[0]).toBeDefined("a1");
			expect(ms[1]).toBeDefined("b1");
		});

		it("z._slice将fn.arguments转换成Array", function() {
			function fn(a1, a2) {
				var args = z._slice(fn.arguments);
				return args;
			}

			var args = fn(1, 2);
			expect(args.constructor).toBe(Array);
		});

		it("z._slice从指定位置开始转换", function() {
			function fn(a1, a2, a3) {
				var args = z._slice(fn.arguments, 1);
				return args;
			}

			var args = fn(1, 2, 3);
			expect(args.length).toBe(2);
			expect(args[0]).toBe(2);
			expect(args[1]).toBe(3);
		});

		it("z._copy会复制不存在成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {};

			z._copy(a, b);

			expect(b.p1).toBeDefined();
		});

		it("z._copy会覆盖已经存在的成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {
				p1: "pb"
			};

			z._copy(a, b);

			expect(b.p1).toBe("pa");
		});

		it("z._merge会复制不存在的成员", function() {
			var a = {
				p1: 'pa',
				p2: 'p2'
			};
			var b = {
				p1: "pb"
			};

			z._merge(a, b);

			expect(b.p2).toBeDefined();
		});

		it("z._merge不会覆盖已经存在的成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {
				p1: "pb"
			};

			z._merge(a, b);

			expect(b.p1).toBe("pb");
		});

		it("$clone", function() {
			var obj = {
				key1: {},
				key2: {
					key21: {},
					key22: "key22"
				},
				key3: "key3"
			};

			var obj2 = $clone(obj);
			expect(obj).toEqual(obj2);
			expect(obj).toNotBe(obj2);
		});

		it("z._keys", function() {
			var o = {a: 'a', b: 'b'};
			var ms = z._keys(o);
			expect(ms).toContain('a');
			expect(ms).toContain('b');
		});

		it("$property", function() {});

		it("$base(this)将调用父原型的构造函数", function() {
			var i = 0;
			function A() {
				i++;
			}

			function B() {
				$base(this);
			}
			$extend(B, A);

			var ab = new B();
			expect(i).toBe(1);
		});

		it("$base(this)将调用父原型的方法", function() {
			function A() {}

			var spy = jasmine.createSpy();

			A.prototype = {
				action: spy
			};

			function B() {
				$base(this);
			}

			B.prototype = {
				action: function() {
					$base(this);
				}
			};

			$extend(B, A);

			var ab = new B();
			ab.action();

			expect(spy).toHaveBeenCalled();
		});

		it("$enum()", function() {
			var weekDay = $enum("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "SaturDay", "Sunday");
			expect(weekDay.Monday).toBeDefined();
			expect(weekDay.Sunday).toBeDefined();
			expect(weekDay.Sunday).toNotBe(weekDay.Monday);

		});

		it("$fn()调用方法自身", function(){
			var fn = function(x, n){
				if(n===0)return 1;
				x *= $fn(x, --n);
				return x;
			};

			expect(fn(2, 4)).toBe(16);
		});

		it("z._containsAll()", function(){
			var set = [1, 2];

			expect(z._containsAll(set, [1,2])).toBeTruthy();

			expect(z._containsAll(set, [1])).toBeTruthy();

			expect(z._containsAll(set, [3])).toBeFalsy();

			expect(z._containsAll(set, [])).toBeFalsy();
		});

		it("z._isPlainObject()", function(){
			expect(z._isPlainObject({})).toBeTruthy();

			expect(z._isPlainObject(window)).toBeFalsy();

			expect(z._isPlainObject(document.body)).toBeFalsy();

			expect(z._isPlainObject([])).toBeFalsy();

			var fn = new Function();
			expect(z._isPlainObject(new fn())).toBeFalsy();

			expect(z._isPlainObject(new Date())).toBeFalsy();

			expect(z._isPlainObject(new Boolean())).toBeFalsy();

			expect(z._isPlainObject([])).toBeFalsy();

			expect(z._isPlainObject("object")).toBeFalsy();
		});
	});
});

