$run(function() {
	eval($global.all);
	
	describe("$Object", function(){
		it("set(),get()", function(){
			var o = new $Object();
			var value = {};
			o.set("prop", value);
			var prop = o.get("prop");
			expect(prop).toBe(value);
		});

		it("proto()获取对象的原型", function(){
			var o = new $Object();
			expect(o.proto()).toBe($Object.prototype);
			expect(o.proto().proto()).toBe(Object.prototype);
		});

		it("property()设置对象属性", function(){
			var o = new $Object();
			o.property("name", {get: function(){return name}, set: function(v){name = v}});
			var name = "jim";
			o.name = name;
			expect(o.name).toBe(name);
		});

		it("property()提供默认的getter, setter", function(){
			var o = new $Object();
			o.property("name");
			var name = "jim";
			o.name = name;
			expect(o.name).toBe(name);
		});

		it("property()一次定义多个属性", function(){
			var o = new $Object();
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


	describe("$Object.include()", function(){
		it("include一个普通对象", function(){
			var o = new $Object();
			var sayHello = function(){};
			o.include({
				sayHello: sayHello
			});

			expect(o.sayHello).toBeDefined();
		});

		it("include一个普通对象", function(){
			var o = new $Object();
			var sayHello = function(){};
			o.include({
				sayHello: sayHello
			});

			expect(o.sayHello).toBeDefined();
		});
	}); 

	describe("$Object.callBase()", function() {
		it("调用父类的构造函数", function(){
			var Class = jasmine.createSpy();
			var Sub = function(){
				this.callBase();
			}
			$class(Class).extend($Object);
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

			$class(BaseBase).extend($Object);

			var param = {};
			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.callBase(param);
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

			$class(BaseBase).extend($Object);

			var Base = function() {};
			$class(Base).extend(BaseBase);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.callBase();
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

			$class(BaseBase).extend($Object);

			var Base = function() {};
			Base.prototype = {
				sayHi: {}
			}

			$class(Base).extend(BaseBase);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.callBase();
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
			$class(BaseBase).extend($Object);

			var Class = function() {};
			Class.prototype = {
				sayHi: function(){
					this.callBase();
				}
			}
			$class(Class).extend(BaseBase);

			var ac = new Class();
			ac.sayHi = function(){
				this.callBase();
			}
			ac.sayHi();

			expect(sayHi).toHaveBeenCalledWith();
		});
	});
});

