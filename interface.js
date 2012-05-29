$global.run(function() {
	/**
	 * @todo 
	 *   1.验证对象的所有成员都符合成员规格
	 *   2.验证数组的所有项都符合成员规格
	 *   3.验证对象是否可以拥有规格以外的成员
	 */
	function Interface(member, type) {
		var option = $option();

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

		$copy(option, this);
	}

	Interface.option = {
		member: {},
		type: null,
		base: null,
		freeze: false
	}

	$class(Interface, {
		base: $Object
	});

	/**
	 * 定义一个接口
	 * @param {Object} member 实现对象应包含的成员
	 * @param {string} type 对象本身的类型
	 * @param {Object} .base 父接口
	 * @param {Boolean} .freeze = false 是否可以拥有member定义以外的成员
	 */
	function $interface(member, type) {
		return new Interface(member, type);
	}

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		base: IObject,
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
		if (!$is(Interface, spec))spec = $interface(spec);

		if (spec.base && !$support(spec.base, o))return false;

		if (spec.type && ! $is(spec.type, o)) return false;

		if (spec.member) {
			var k, ms = spec.member;
			for (k in ms) {
				var mspec = new $MemberSpec(ms[k], k);
				if (!mspec.check(o, k)) return false;
			}

			if (spec.freeze) {
				var allms = $clone(ms);
				$upEach(spec, 'base', function(base){
					$merge(base.member, allms);
				});

				for (k in o) {
					if (! (k in allms)) return false;
				}
			}
		}

		return true;
	}

	//这两个接口定义在interface定义之前的依赖文件中，在这里成为正式的接口
	$interface(IClass);
	$interface(IClassDefine);

	$interface(IObject);

	$interface(IType);

	$interface(IMemberSpec);


	//发布全局对象
	$global("IInterface", IInterface);

	$global("Interface", Interface);

	$global("$interface", $interface);

	$global("$support", $support);
});

