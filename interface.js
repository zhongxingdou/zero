$global.run(function() {
	/**
	 * @todo 
	 *   1.验证对象的所有成员都符合成员规格
	 *   2.验证数组的所有项都符合成员规格
	 *   3.验证对象是否可以拥有规格以外的成员
	 */

	function $Interface(o) {
		var self = arguments.callee;
		var option = $merge(self.option, o);
		$copy(option, this);
	}

	$Interface.option = {
		base: null,
		member: {},
		type: null,
		freeze: false
	}

	/**
	 * 定义一个接口
	 * @param {Object} member 实现对象应包含的成员
	 * @param {string} type 对象本身的类型
	 * @param {Object} .base 父接口
	 * @param {Boolean} .freeze = false 是否可以拥有member定义以外的成员
	 */
	function $interface(member, type) {
		var option = $option($Interface.option);

		if (option.type === undefined) {
			option.type = {instanceof: Object};
		}

		var p, ms = option.member;
		for(p in ms){
			var m = ms[p];
			if(!$is($Type, m)){
				ms[p] = $typedef(m);
			}
		}

		return new $Interface(option);
	}

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		member: {
			base: "[object]",
			member: "[object]",
			type: "[object]",
			freeze: "[boolean]"
		},
		freeze: true,
		type: "object"
	});

	function $support(spec, o) {
		if (!$is($Interface, spec))spec = $interface(spec);

		if (spec.base && !$support(spec.base, o))return false;

		if (spec.type && ! $is(spec.type, o)) return false;

		if (spec.member) {
			var k, ms = spec.member;
			for (k in ms) {
				var mspec = new $MemberSpec(ms[k], k);
				if (!mspec.check(o, k)) return false;
			}

			//验证是否拥有声明以外的成员，只能验证对象拥有的成员，而不能验证原型继承到的成员，因为不好枚举到
			if (spec.freeze) {
				for (k in o) {
					if (! (k in ms)) return false;
				}
			}
		}

		return true;
	}

	//这两个接口定义在interface定义之前的依赖文件中，在这里成为正式的接口
	$interface(IType);
	$interface(IMemberSpec);

	$global("IInterface", IInterface);

	$global("$interface", $interface);

	$global("$support", $support);
});

