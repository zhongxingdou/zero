$run(function() {
	eval($global.all);

	describe("$interface()", function() {
		it("创建interface符合IInterface接口", function() {
			var option = {
				member: {},
				type: Object
			}

			var face = $interface(option);
			expect($support(IInterface, face)).toBeTruthy();
		});

		it("使用普通对象创建interface", function(){
			var face = $interface({
				m1: {}
			})

			expect(face.member.m1).toBeDefined();
		});
	});

	describe("$support()", function() {
		it("验证对象包含成员", function() {
			var obj = {
				name: "Lily",
				score: 85,
				birthday: new Date("1988/3/1")
			}

			var face = $interface({
				name: "string",
				score: "number",
				birthday: {
					instanceOf: Date
				}
			});

			expect($support(face, obj)).toBeTruthy();
		});

		it("验证freeze声明", function() {
			var face = $interface({
				member: {
					a1: "[string]"
				},
				freeze: true
			});

			expect($support(face, {
				key: ""
			})).toBeFalsy();

			expect($support(face, {
				a1: "hello"
			})).toBeTruthy();
		});

		it("验证[]是Array和Object的实例", function() {
			var baseFace = $interface({
				type: {
					instanceOf: Object
				}
			});

			var face = $interface({
				base: baseFace,
				type: {
					instanceOf: Array
				}
			});

			expect($support(face, [])).toBeTruthy();
			expect($support({
				type: Array,
				base: {
					type: Object
				}
			},
			[])).toBeTruthy();
		});
	});
});

