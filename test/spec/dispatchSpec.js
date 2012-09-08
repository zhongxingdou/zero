$run(function() {
	eval($global.all);

	describe("$dispatch()", function(){
		it("找到参数数量一样的方法", function(){
			var fnWithOne = jasmine.createSpy();
			fnWithOne.option = { name: 'string' }

			var fnWithTwo = jasmine.createSpy();
			fnWithTwo.option = {
				name: 'string',
				interest: 'string'
			}

			var fn = $dispatch(fnWithOne, fnWithTwo);

			fn("jim");
			expect(fnWithOne).toHaveBeenCalledWith("jim");

			fn("jim","lily");
			expect(fnWithTwo).toHaveBeenCalledWith("jim","lily");
		});

		it("找到类型相同的方法", function(){
			var fnWithStringAndNumber = jasmine.createSpy();
			fnWithStringAndNumber.option = {
				name: 'string',
				age: 'number'
			}

			var fnWithTwoString = jasmine.createSpy();
			fnWithTwoString.option = {
				name: 'string',
				interest: 'string'
			}

			var fn = $dispatch([fnWithStringAndNumber, fnWithTwoString]);

			fn("jim",8);
			expect(fnWithStringAndNumber).toHaveBeenCalled();
			fnWithStringAndNumber.reset();

			fn("jim","lily");
			expect(fnWithTwoString).toHaveBeenCalled();
			fnWithTwoString.reset();

			//没有匹配到
			fn(true,"lily");
			expect(fnWithTwoString).wasNotCalled();
			expect(fnWithStringAndNumber).wasNotCalled();
		});

		it("key/value参数", function(){
			var fnWithStringAndNumber = jasmine.createSpy();
			fnWithStringAndNumber.option = {
				name: 'string',
				age: 'number'
			}

			var fnWithTwoString = jasmine.createSpy();
			fnWithTwoString.option = {
				name: 'string',
				interest: 'string'
			}

			var fn = $dispatch([fnWithStringAndNumber, fnWithTwoString]);

			var params = {name: "jim", age: 8};
			fn(params);
			expect(fnWithStringAndNumber).toHaveBeenCalledWith(params);
		});

		it("$dispatch生成一个方法，并执行它", function(){
			var fnWithStringAndNumber = jasmine.createSpy();
			fnWithStringAndNumber.option = {
				name: 'string',
				age: 'number'
			}

			function fnWithTwoString(){
			}
			fnWithTwoString.option = {
				name: 'string',
				interest: 'string'
			}

			var fn = $dispatch(fnWithStringAndNumber, fnWithTwoString);
			fn("jim", 8);

			//expect(fnWithStringAndNumber).toHaveBeenCalledWith(["jim",8]);
			expect(fnWithStringAndNumber).toHaveBeenCalled();
			
		});
	});
});
