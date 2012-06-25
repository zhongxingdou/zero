$run(function() {
	eval($global.all);

	describe("util.js", function() {
		it("$every将在处理函数返回false时中断", function() {
			var i;
			$every([1, 2, 3], function(n) {
				i = n;
				if (n === 2) return false;
			});
			expect(i).toBe(2);
		});

		it("$every遍历完数组时返回true", function() {
			var b = $every([1, 2, 3], function(n) {});
			expect(b).toBe(true);
		});

		it("$everyKey", function() {
			var o = {
				key1: "key1",
				key2: "key2"
			}

			var keys = [];
			var values = [];
			$everyKey(o, function(key, v) {
				keys.push(key);
				values.push(v);
			});

			expect(keys).toContain("key1");
			expect(keys).toContain("key2");

			expect(values).toContain("key1");
			expect(values).toContain("key2");
		});

		it("$everyKey()如果处理函数返回false将中断遍历", function() {
			var o = {
				key1: "key1",
				key2: "key2",
				key3: "key3"
			}

			var keys = [];
			var values = [];
			$everyKey(o, function(key, v) {
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

		it("$traceProto", function() {
			function A() {};
			A.prototype = {
				a1: {}
			};

			function B() {};
			B.prototype.b1 = {};
			$extend(B, A);

			var b = new B();
			var ms = [];
			$traceProto(b, function(proto) {
				ms.push(proto);
			});

			expect(ms[0]).toBeDefined("a1");
			expect(ms[1]).toBeDefined("b1");
		});

		it("$slice将fn.arguments转换成Array", function() {
			function fn(a1, a2) {
				var args = $slice(fn.arguments);
				return args;
			}

			var args = fn(1, 2);
			expect(args.constructor).toBe(Array);
		});

		it("$slice从指定位置开始转换", function() {
			function fn(a1, a2, a3) {
				var args = $slice(fn.arguments, 1);
				return args;
			}

			var args = fn(1, 2, 3);
			expect(args.length).toBe(2);
			expect(args[0]).toBe(2);
			expect(args[1]).toBe(3);
		});

		it("$copy会复制不存在成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {};

			$copy(a, b);

			expect(b.p1).toBeDefined();
		});

		it("$copy会覆盖已经存在的成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {
				p1: "pb"
			};

			$copy(a, b);

			expect(b.p1).toBe("pa");
		});

		it("$merge会复制不存在的成员", function() {
			var a = {
				p1: 'pa',
				p2: 'p2'
			};
			var b = {
				p1: "pb"
			};

			$merge(a, b);

			expect(b.p2).toBeDefined();
		});

		it("$merge不会覆盖已经存在的成员", function() {
			var a = {
				p1: 'pa'
			};
			var b = {
				p1: "pb"
			};

			$merge(a, b);

			expect(b.p1).toBe("pb");
		});

		it("$option", function() {
			function fn(p1, p2) {
				var option = $option();
				return option;

			}
			fn.option = {
				key1: "key1",
				key2: "key2",
				key3: "key3"
			}

			var option = fn("k1", "k2");

			expect(option).toBeDefined();

			expect(option.key1).toBe("k1");
			expect(option.key2).toBe("k2");
			expect(option.key3).toBe("key3");
		});

		it("$clone", function() {
			var obj = {
				key1: {},
				key2: {
					key21: {},
					key22: "key22"
				},
				key3: "key3"
			}

			var obj2 = $clone(obj);
			expect(obj).toEqual(obj2);
			expect(obj).toNotBe(obj2);
		});

		it("$like", function() {
			var a = {
				a: 'a',
				b: 'b'
			};
			var b = {
				a: 'a',
				b: 'b'
			};
			expect($like(a, b)).toBeTruthy();
		});

		/*
	it("$getAllKeys", function() {
		var o = {a: 'a', b: 'b'}
		var ms = $getAllKeys(o)
		expect(ms).toContain('a');
		expect(ms).toContain('b');
	});
	*/

		it("$getProtoMember", function() {
			function A() {};
			A.prototype = {
				a1: "A.a1"
			};
			A.prototype.constructor = A;

			function B() {};
			B.prototype.b1 = 'Bb1';
			B.prototype.a1 = 'Ba1';
			$extend(B, A);

			function C() {};
			C.prototype.c1 = "Cc1";
			$extend(C, B);

			var ac = new C();
			ac.a1 = "ac.a1";

			expect($getProtoMember(ac, 'a1')).toBe(C.prototype.a1);

			expect($getProtoMember(ac, 'proto.a1')).toBe(B.prototype.a1);
			expect($getProtoMember(ac, 'proto.a1')).toNotBe(A.prototype.a1);

			expect($getProtoMember(ac, 'proto.proto.a1')).toBe(B.prototype.a1);
			expect($getProtoMember(ac, 'proto.proto.proto.a1')).toBe(A.prototype.a1);
		});

		it("$property", function() {});

		it("$callBase(this)将调用父原型的构造函数", function() {
			var i = 0;
			function A() {
				i++;
			}

			function B() {
				$callBase(this);
			}
			$extend(B, A);

			var ab = new B();
			expect(i).toBe(1);
		});

		it("$callBase(this)将调用父原型的方法", function() {
			function A() {}

			var spy = jasmine.createSpy();

			A.prototype = {
				action: spy
			}

			function B() {
				$callBase(this);
			}

			B.prototype = {
				action: function() {
					$callBase(this);
				}
			}

			$extend(B, A);

			var ab = new B();
			ab.action();

			expect(spy).toHaveBeenCalled();
		});

		/*it("$call()", function() {
			var fn = undefined;
			$call(fn);

			var fn2 = jasmine.createSpy();
			$call(fn2);
			expect(fn2).toHaveBeenCalled();

			var o = {};
			var fn3 = function(name) {
				this.name = name;
			}
			fn3.scope = o;

			$call(fn3, ['jim']);

			expect(o.name).toBe('jim');
		});*/

		it("$enum()", function() {
			var weekDay = $enum("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "SaturDay", "Sunday");
			expect(weekDay.Monday).toBeDefined();
			expect(weekDay.Sunday).toBeDefined();
			expect(weekDay.Sunday).toNotBe(weekDay.Monday);

		});
	});
});

