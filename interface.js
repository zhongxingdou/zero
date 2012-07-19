$run(function() {
	eval($global.all);

	/**
	 * 接口
	 * @todo 验证数组的所有项都符合成员规格
	 * @param {Object} member 描述对象的成员
	 * @param {Object} type 描述对象的类型
	 */
	function Interface(member, type) {
		this.base = null;
		this.freeze = false;
		this.type = type || Object; //type可以为Object或Function，如是其它的，可以通过base来指定
		this.member = member;
		var MemberSpec = z.MemberSpec;

		if(member.member){//说明为hash形式的参数
			$copy(member, this);
			this.type = member.type || Object; //确保忽略type参数，此时它应该定义在member.type
		}

		//if(typeof this.type == 'object'){
			//this.type = $spec(this.type);
		//}
		if(this.type){
			this.type = $spec(this.type);
		}

		//将成员的描述实例化成为MemberSpec
		var p, ms = this.member;
		for(p in ms){
			var m = ms[p];
			if(!(m instanceof MemberSpec)){
				ms[p] = new MemberSpec(m);
			}
		}
	}


	Interface.prototype = {
		/**
		 * 添加成员描述
		 * @param {String} name 成员名称
		 * @param {Object} spec 成员描述
		 */
		addMember: function(name, spec){
			this.member[name] = new z.MemberSpec(spec);
			return this;
		},
		/**
		 * 添加成员描述
		 * @param {String} name 成员名称
		 */
		removeMember: function(name){
			delete this.member[name];
		}
	}

	$class(Interface).extend(z.Base);

	/**
	 * 定义一个接口
	 * @param {Object} member 实现对象应包含的成员
	 * @param {string} type 对象本身的类型
	 * @param {Object} .base 父接口
	 * @param {Boolean} .freeze = false 是否可以拥有member定义以外的成员
	 */
	function $interface(member, type) {
		if(member instanceof Interface)return member;

		return new Interface(member, type);
	}


	$interface(z.IBase);

	$interface(z.ITypeSpec);

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		base: z.IBase,
		member: {
			base: "[object]",
			member: "[object]",
			type: z.ITypeSpec,
			freeze: "[boolean]",
			addMember: "function(name, spec)",
			removeMember: "function(name)"
		},
		freeze: false,
		type: "object"
	});

	/**
	 * 检测某个对象是否符合接口描述
	 * @param {Interface} spec 接口
	 * @param {Object} o 被检测的对象
	 */
	function $support(spec, o) {
		if (!$is(Interface, spec))spec = $interface(spec);

		if (spec.base && !$support(spec.base, o))return false;

		if (spec.type && ! $is(spec.type, o)) return false;

		if (spec.member) {
			var k, ms = spec.member;
			for (k in ms) {
				if (!ms[k].check(o, k)) return false;
			}

			if (spec.freeze) {
				var allms = {};
				$trace(spec, 'base', function(base){
					$merge(base.member, allms);
				});

				for (k in o) {
					if (! (k in allms)) return false;
				}
			}
		}

		return true;
	}

	z.IInterface = IInterface;

	z.Interface = Interface;

	$global("$interface", $interface);

	$global("$support", $support);
});

