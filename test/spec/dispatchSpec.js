$run(function() {
	eval($global.all);

	describe("$dispatch()", function(){
		it("找到参数数量一样的方法", function(){
			function fn(){
				return $dispatch([fnWithOne, fnWithTwo]);
			}

			function fnWithOne(){}
			fnWithOne.option = { name: 'string' }

			function fnWithTwo(){}
			fnWithTwo.option = {
				name: 'string',
				interest: 'string'
			}

			expect(fn("jim")).toBe(fnWithOne);
			expect(fn("jim","lily")).toBe(fnWithTwo);
		});

		it("找到类型相同的方法", function(){
			function fn(){
				return $dispatch([fnWithStringAndNumber, fnWithTwoString]);
			}
			

			function fnWithStringAndNumber(){
			}
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

			expect(fn("jim",8)).toBe(fnWithStringAndNumber);
			expect(fn("jim","lily")).toBe(fnWithTwoString);

			//没有匹配到
			expect(fn(true,"lily")).toBeUndefined();
		});

		it("key/value参数", function(){
			function fn(){
				return $dispatch([fnWithStringAndNumber, fnWithTwoString]);
			}

			function fnWithStringAndNumber(){
			}
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


			expect(fn({name: "jim", age: 8})).toBe(fnWithStringAndNumber);
		});

		it("$overwrite生成一个方法，此方法使用$dispatch选择一个重载方法，并执行它", function(){
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

			var fn = $overwrite(fnWithStringAndNumber, fnWithTwoString);
			fn("jim", 8);

			//expect(fnWithStringAndNumber).toHaveBeenCalledWith(["jim",8]);
			expect(fnWithStringAndNumber).toHaveBeenCalled();
			
		});
	});
});
