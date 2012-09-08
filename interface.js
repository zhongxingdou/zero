$run(function() {
	eval($global.all);

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		member: {
			base: "[object]",
			member: "[object]",
			type: z.ITypeSpec,
			freeze: "[boolean]"
		}
	});

	/**
	 * 接口
	 * @todo 验证数组的所有项都符合成员规格
	 * @param {Object} member 描述对象的成员
	 * @param {Object} type 描述对象的类型
	 */
	function parseInterface(member, type) {
		var o = {};
		o.base = null;
		o.freeze = false;
		o.type = type || Object; //type可以为Object或Function，如是其它的，可以通过base来指定
		o.member = member;

		// $implement(IInterface, o);

		if(member.member){//说明为hash形式的参数
			z._copy(member, o);
			o.type = member.type || Object; //确保忽略type参数，此时它应该定义在member.type
		}

		//if(typeof this.type == 'object'){
			//this.type = $spec(this.type);
		//}
		if(o.type){
			o.type = z.parseTypeSpec(o.type);
		}

		//将成员的描述实例化成为MemberSpec
		var MemberSpec = z.MemberSpec;
		var p, ms = o.member;
		for(p in ms){
			var m = ms[p];
			if(!(m instanceof MemberSpec)){
				ms[p] = new MemberSpec(m);
			}
		}

		return o;
	}

	/**
	 * 定义一个接口
	 * @param {Object} member 实现对象应包含的成员
	 * @param {string} type 对象本身的类型
	 * @param {Object} .base 父接口
	 * @param {Boolean} .freeze = false 是否可以拥有member定义以外的成员
	 */
	function $interface(member, type) {
		var o = parseInterface(member, type);
		$implement(IInterface, o);
		return o;
	}

	/**
	 * 检测某个对象是否符合接口描述
	 * @param {Interface} spec 接口
	 * @param {Object} o 被检测的对象
	 */
	function $support(spec, o) {
		if(!spec.__implementations__ || spec.__implementations__.indexOf(IInterface) == -1){
			spec = $interface(spec);
		}

		if (spec.base && !$support(spec.base, o))return false;

		if (spec.type && ! $is(spec.type, o)) return false;

		if (spec.member) {
			var k, ms = spec.member;
			for (k in ms) {
				if (!ms[k].check(o, k)) return false;
			}

			if (spec.freeze) {
				var allms = {};
				z._trace(spec, 'base', function(base){
					z._merge(base.member, allms);
				});

				for (k in o) {
					if (! (k in allms)) return false;
				}
			}
		}

		return true;
	}

	z.IInterface = IInterface;

	$global("$interface", $interface);

	$global("$support", $support);
});

