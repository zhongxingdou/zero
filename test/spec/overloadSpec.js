$run(function() {
    eval($global.all);

    describe("$overload()", function() {
        it("找到参数数量一样的方法", function() {
            var fnWithOne = jasmine.createSpy();
            fnWithOne.option = {
                name: 'string'
            }

            var fnWithTwo = jasmine.createSpy();
            fnWithTwo.option = {
                name: 'string',
                interest: 'string'
            }

            var fn = $overload(fnWithOne, fnWithTwo);

            var param1 = {
                name: "jim"
            };
            fn(param1);
            expect(fnWithOne).toHaveBeenCalledWith(param1);

            var param2 = {
                name: "jim",
                interest: "swimming"
            };
            fn(param2);
            expect(fnWithTwo).toHaveBeenCalledWith(param2);
        });

        it("找到类型相同的方法", function() {
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

            var fn = $overload(fnWithStringAndNumber, fnWithTwoString);

            fn({
                name: "jim",
                age: 8
            });
            expect(fnWithStringAndNumber).toHaveBeenCalled();
            fnWithStringAndNumber.reset();

            fn({
                name: "jim",
                interest: "swimming"
            });
            expect(fnWithTwoString).toHaveBeenCalled();
            fnWithTwoString.reset();

            //没有匹配到
            fn({
                name: true,
                interest: "swimming"
            });
            expect(fnWithTwoString).wasNotCalled();
            expect(fnWithStringAndNumber).wasNotCalled();
        });

        it("根据形参的数量不同找到目标方法", function() {
            var fnTwo = jasmine.createSpy();
            var fnTwo2 = jasmine.createSpy();
            var fnOne = jasmine.createSpy();

            var fn = $overload([fnTwo, [String, String]], [fnOne, [String]]);

            fn("abc");
            expect(fnOne).toHaveBeenCalled();

            fn("abc", "abc");
            expect(fnTwo).toHaveBeenCalled();

			fn.overload(fnTwo2, [String, Number]);
			fn("abc",3);
            expect(fnTwo2).toHaveBeenCalled();
        });

    });
});
