describe("util.js", function() {
	it("$each将在处理函数返回false时中断", function(){
		var i;
		$each([1,2,3], function(n){
			i = n;
			if(n===2)return false;
		});
		expect(i).toBe(2);
	});

	it("$each遍历完数组时返回true", function(){
		var b = $each([1,2,3], function(n){});
		expect(b).toBe(true);
	});

	it("$makeArray将fn.arguments转换成Array", function(){
		function fn (a1,a2) {
			var args = $makeArray(fn.arguments);
			return args;
		}

		var args = fn(1,2);
		expect(args.constructor).toBe(Array);
	});

	it("$makeArray从指定位置开始转换", function(){
		function fn (a1,a2,a3) {
			var args = $makeArray(fn.arguments, 1);
			return args;
		}

		var args = fn(1,2,3);
		expect(args.length).toBe(2);
		expect(args[0]).toBe(2);
		expect(args[1]).toBe(3);
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

	it("$merge不会覆盖已经存在的成员", function(){
		var a = {p1: 'pa'};
		var b = {p1: "pb"};

		$merge(a, b);

		expect(b.p1).toBe("pb");
	});

	it("$getAllMember", function() {
		var o = {a: 'a', b: 'b'}
		var ms = $getAllMembers(o)
		expect(ms).toContain('a');
		expect(ms).toContain('b');
	});

	it("$getProtoMember", function(){
		function A(){};
		A.prototype = {a1: {}};
		A.prototype.constructor = A;

		function B(){};
		B.prototype = new A();
		B.prototype.b1 = {};
		B.prototype.a1 = {};
		B.prototype.constructor = B;

		function C(){};
		C.prototype = new B();
		C.prototype.c1 = {};
		C.prototype.constructor = C;

		var ac = new C();
		ac.a1 = {};

		expect($getProtoMember(ac, 'a1')).toBe(C.prototype.a1);

		expect($getProtoMember(ac, 'proto.a1')).toBe(B.prototype.a1);
		expect($getProtoMember(ac, 'proto.a1')).toNotBe(A.prototype.a1);

		expect($getProtoMember(ac, 'proto.proto.a1')).toBe(B.prototype.a1);
		expect($getProtoMember(ac, 'proto.proto.proto.a1')).toBe(A.prototype.a1);
	});

	it("$like", function(){
		var a = {a: 'a', b:'b'};
		var b = {a: 'a', b:'b'};
		expect($like(a,b)).toBeTruthy();
	});

	it("$property", function(){
		var o = {};
		$property(o, 'name');
		expect(o.getName).toBeDefined();
		expect(o.setName).toBeDefined();

		var name = "Lucy";
		o.setName(name);
		expect(o.getName()).toBe(name);
	});

	it("$callBase(this)将调用父原型的构造函数", function(){
		var i = 0;
		function A(){
			i++;
		};
		A.prototype.constructor = A;

		function B(){
			$callBase(this);
		};
		B.prototype = new A();
		B.prototype.constructor = B;

		var ab = new B();
		expect(i).toBe(2);
	});

	it("$callBase(this, action)将调用父原型的方法", function(){
		var i = 0;
		function A(){
		};
		A.prototype = {action: function(){i++}};
		A.prototype.constructor = A;

		function B(){
			$callBase(this);
			$callBase(this,'action');
		};
		B.prototype = new A();
		B.prototype.constructor = B;

		var ab = new B();
		expect(i).toBe(1);
	});

	it("$eachMember", function(){
	
	});

	it("$eachProto", function(){
	
	});

	it("$upEach", function(){
	
	});
});


