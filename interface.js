$run(function() {
	eval($global.all);

	/**
	 * @todo 
	 *   1.验证对象的所有成员都符合成员规格
	 *   2.验证数组的所有项都符合成员规格
	 *   3.验证对象是否可以拥有规格以外的成员
	 */
	function Interface(member, type) {
		this.base = null;
		this.freeze = false;
		this.type = type || Object;
		this.member = member;

		if(member.member){
			$copy(member, this);
		}

		if(typeof this.type == 'object'){
			this.type = $spec(this.type);
		}

		var p, ms = this.member;
		for(p in ms){
			var m = ms[p];
			if(!(m instanceof MemberSpec)){
				ms[p] = new MemberSpec(m);
			}
		}
	}


	Interface.prototype = {
		addMember: function(name, spec){
			this.member[name] = new MemberSpec(spec);
			return this;
		},
		removeMember: function(name){
			delete this.member[name];
		}
	}

	$class(Interface).extend($Object);

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


	IObject = $interface(IObject);

	/**
	 * 接口对象的接口
	 * 定义了instanceOf的时候
	 */
	var IInterface = $interface({
		base: IObject,
		member: {
			base: "[object]",
			member: "[object]",
			type: ITypeSpec,
			freeze: "[boolean]",
			addMember: "function",
			removeMember: "function"
		},
		freeze: false,
		type: "object"
	});

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




	/*
	function $typedef(interface, creator, name){
		var option = $option();

		type.interface = interface;
				
		type.validate = function(o){
			if(!$support(interface, o)){
				throw "Invalid " + name;
			}
		}

		return type;
	}
	$typdef.option = {
		interface: null,
		creator: function(o){
			var self = auguments.callee;
			self.validate(o);
			$copy(o, this);
		},
		name: null
	}*/


	//这两个接口定义在interface定义之前的依赖文件中，在这里成为正式的接口
	IClass = $interface(IClass);
	//IClassDefine = $interface(IClassDefine);


	ITypeSpec = $interface(ITypeSpec);

	//IMemberSpec = $interface(IMemberSpec);

	$global("IClass", IClass);
	//$global("IClassDefine", IClassDefine);
	$global("IObject", IObject);
	$global("ITypeSpec", ITypeSpec);
	//$global("IMemberSpec", IMemberSpec);


	//发布全局对象
	$global("IInterface", IInterface);

	$global("Interface", Interface);

	$global("$interface", $interface);

	$global("$support", $support);
});

