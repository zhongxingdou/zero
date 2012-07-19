$run(function() {
	eval($global.all);

	describe("$option：fn.option成员值直接作为默认值", function() {
		var fn;

		beforeEach(function(){
			fn = function(p1, p2) {
				var option = $option();
				return option;
			}
			fn.option = { key1: {value: {}}, key2: {value: {}}}
		});

		it("$option()", function() {
			var param = [{}, {}]
			var option = fn(param[0], param[1]);

			expect(option).toBeDefined();

			expect(option.key1).toBe(param[0]);
			expect(option.key2).toBe(param[1]);
		});

		it("只有一个object参数且它的keys是option的keys的子集，会和option合并", function(){
			var param = {key1: {}};
			var option = fn(param);

			expect(option.key1).toBe(param.key1);
			expect(option.key2).toBe(fn.option.key2.value);
		});

		it("只有一个object参数但它的keys不是option的keys的子集，会被当作第一个参数", function(){
			var param = {key3: {}};
			var option = fn(param);

			expect(option.key1).toBe(param);
		});

		it("只有一个object参数但它的keys不是option的keys的子集，option的第二个key之后的项会被合并", function(){
			var param = {key3: {}};
			var option = fn(param);

			expect(option.key2).toBe(fn.option.key2.value);
		});

		it("只有一个object参数且它是空对象, 会被当做第一个参数", function(){
			var param = {};
			var option = fn(param);

			expect(option.key1).toBe(param);
		});

		it("有两个以上参数时，第一个参数不会被作为key/value参数，即使它是$argu创建的", function(){
			var param = $argu({key1: {}});
			var option = fn(param, param);

			expect(option.key1).toBe(param);
			expect(option.key2).toBe(param);
		});

		it("只有一个参数时，$argu创建的参数会被当做key/value参数", function(){
			var key1 = {};
			var param = $argu({key1: key1});
			var option = fn(param);
			expect(option.key1).toBe(key1);
		});

	});

	describe("$option：fn.option成员值作为成员规格对象", function(){
		it("option.key={type: String}没有定义value时，值为undefined", function(){
			var fn = function(){
				return $option();
			}
			fn.option = {
				key1 : {type: String}
			}

			var option = fn();
			expect(option.key1).toBeUndefined();
		});
	}); 
});

