describe("$interface()", function() {
	it("创建interface符合IInterface接口", function() {
		var option = {
			member: {},
			type: Object
		}

		var face = $interface(option);
		expect($support(IInterface, face)).toBeTruthy();
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
				instanceof: Date
			}
		});

		expect($support(face, obj)).toBeTruthy();
	});

	it("验证freeze声明", function() {
		var face = $interface({
			member: {a1: "[string]"},
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
				instanceof: Object
			}
		});

		var face = $interface({
			base: baseFace,
			type: {
				instanceof: Array
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

