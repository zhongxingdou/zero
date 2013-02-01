$run(function() {
	eval($global.all);
	
	describe("z.Base", function(){
		it("set(),get()", function(){
			var o = new z.Base();
			var value = {};
			o.set("prop", value);
			var prop = o.get("prop");
			expect(prop).toBe(value);
		});

		it("proto()获取对象的原型", function(){
			var o = new z.Base();
			expect(o.proto()).toBe(z.Base.prototype);
			expect(o.proto().proto()).toBe(Object.prototype);
		});

		it("property()设置对象属性", function(){
			var o = new z.Base();
			var name = "";
			o.property("name", {
				get: function(){return name}, 
				set: function(v){name = v + v}
			});
			o.name = "jim";
			expect(o.name).toBe("jimjim");
		});

		it("property()提供默认的getter, setter", function(){
			var o = new z.Base();
			o.property("name");
			var name = "jim";
			o.name = name;
			expect(o.name).toBe(name);
		});

		it("property()一次定义多个属性", function(){
			var o = new z.Base();
			o.property({
				"name": {},
				"age": {}
			});
			o.name = {};
			o.age = {};
			expect(o.name).toBeDefined();
			expect(o.name).toBeDefined();
		});
	}); 


	describe("z.Base.include()", function(){
		it("include一个普通对象", function(){
			var o = new z.Base();
			var sayHello = function(){};
			o.include({
				sayHello: sayHello
			});

			expect(o.sayHello).toBeDefined();
		});

		it("include一个普通对象", function(){
			var o = new z.Base();
			var sayHello = function(){};
			o.include({
				sayHello: sayHello
			});

			expect(o.sayHello).toBeDefined();
		});
	}); 

	describe("z.Base.base()", function() {
		it("调用父类的构造函数", function(){
			var Class = jasmine.createSpy();
			var Sub = function(){
				this.base();
			}
			$class(Class).extend(z.Base);
			$class(Sub).extend(Class);

			var asub = new Sub();
			expect(Class).toHaveBeenCalled();
		});

		it("可以调用到父原型的同名方法并传递实例调用时提供的参数", function() {
			var BaseBase = function() {}

			var sayHi = jasmine.createSpy()

			BaseBase.prototype = {
				sayHi: sayHi
			}

			$class(BaseBase).extend(z.Base);

			var param = {};
			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.base(param);
				}
			}
			$class(Class).extend(BaseBase);

			var ac = new Class();
			ac.sayHi();

			expect(sayHi).toHaveBeenCalledWith(param);
		});


		it("可以逐步向上的方式调用到原型链中的同名方法", function() {
			var BaseBase = function() {}

			var sayHi = jasmine.createSpy()

			BaseBase.prototype = {
				sayHi: sayHi
			}

			$class(BaseBase).extend(z.Base);

			var Base = function() {};
			$class(Base).extend(BaseBase);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.base();
				}
			}
			$class(Class).extend(Base);

			var ac = new Class();
			ac.sayHi();

			expect(sayHi).toHaveBeenCalled();
		});


		it("如果原型链中存在非方法的同名对象，会停止向更上级原型获取同名方法", function() {
			var BaseBase = function() {}

			var sayHi = jasmine.createSpy()

			BaseBase.prototype = {
				sayHi: sayHi
			}

			$class(BaseBase).extend(z.Base);

			var Base = function() {};
			Base.prototype = {
				sayHi: {}
			}

			$class(Base).extend(BaseBase);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.base();
				}
			}
			$class(Class).extend(Base);

			var ac = new Class();
			ac.sayHi();

			expect(sayHi).wasNotCalled();
		});

		it("在对象owner的同名方法中同样会调用父原型以上原型的同名方法，而不是原型的", function() {
			var BaseBase = function() {}
			var sayHi = jasmine.createSpy()
			BaseBase.prototype = {
				sayHi: sayHi
			}
			$class(BaseBase).extend(z.Base);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.base();
				}
			}
			$class(Class).extend(BaseBase);

			var ac = new Class();
			ac.sayHi = function(){
				this.base();
			}
			ac.sayHi();

			expect(sayHi).toHaveBeenCalledWith();
		});

		it("对象添加实现的接口成功", function(){
			var o = new z.Base();
			var a = {};
			o.implement(a);

			expect(o.__implns__).toContain(a);
			expect(o.getImplns()).toContain(a);

			var b = {};
			var c = {};
			o.implement([c, b]);

			expect(o.__implns__).toContain(c);
			expect(o.__implns__).toContain(b);

			expect(o.getImplns()).toContain(c);
			expect(o.getImplns()).toContain(b);
		})
	});
});

