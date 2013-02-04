$run(function() {
	eval($global.all);

	describe("$protocol()", function() {
		it("创建protocol符合IInterface接口", function() {
			var option = {
				member: {},
				type: Object
			}

			var face = $protocol(option);
			expect($support(z.IInterface, face)).toBeTruthy();
		});

		it("使用普通对象创建protocol", function(){
			var face = $protocol({
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

			var face = $protocol({
				name: "string",
				score: "number",
				birthday: {
					instanceOf: Date
				}
			});

			expect($support(face, obj)).toBeTruthy();
		});

		it("验证freeze声明", function() {
			var face = $protocol({
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
			var baseFace = $protocol({}, Object); 
			var face = $protocol({
				base: baseFace,
				type: {
					instanceOf: Array
				},
				member: {}
			});

			expect($support(face, [])).toBeTruthy();

			var face2 = {
				type: Array,
				base: { type: Object, member: {} },
				member: {}
			}

			expect($support(face2, [])).toBeTruthy();
		});
	});
});

