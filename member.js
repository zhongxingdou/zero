$run(function() {
	eval($global.all);

	var IMemberSpec = {
		required: "boolean",
		type: [Object, Array],
		ownProperty: "boolean",
		check: "function(o, name)",
		value: Object
	}

	/**
	 * 对象的成员规格
	 * @todo 缓存常见的MemberSpec，缓存一个接口中重复的
	 * @param {Object} spec
	 */
	function MemberSpec(spec) {
		var self = arguments.callee;

		if(spec instanceof self){
				return spec;
		}

		var t = typeof spec;
		if (t == "string") {//字符表达式的形式表示MemberSpec.option
			$copy(self.__parse(spec), this);
		}else if(t == "object"){
			$copy(spec, this);
		}else if(t == "function"){ //声明此成员的constructor
			this.type = spec;
		}

		$merge(arguments.callee.option, this);
	}

	MemberSpec.option = {
		required: false, //字符串表达式可用[]括住的表示非必须required=false
		type: null, //字符表达式可用|分隔多种不同的类型
		ownProperty: false
	}

	/**
	 * 解析成员规格字符表达式
	 * @param {String} exp
	 */
	MemberSpec.__parse = function(exp) {
		var spec = {};
		var m = exp.match(/^\[(.*)\]$/);
		if (m) {
			spec.required = false;
			exp = m[1];
		}

		if (exp.indexOf("|") != - 1) {
			spec.type = exp.split("|");
		} else {
			spec.type = exp;
		}
		return spec;
	}

	MemberSpec.prototype = {
		/**
		 * 检查对象成员是否符合成员规格
		 * @param {Object} o 成员的拥有者
		 * @param {String} name 成员的名称
		 */
		check: function(o, name) {
			var v = o[name];

			if(v == null){
				return !this.required;
			}


			if (this.type) {
				var t = this.type;
				if ($is(Array, t)) {
					var isType = false;
					for (var i = 0, l = t.length; i < l; i++) {
						if ($is(t[i], v)) {
							isType = true;
							break;
						}
					}

					if (!isType) return false;
				} else {
					if (!$is(t, v)) return false;
				}
			}

			if (this.ownProperty && ! o.hasOwnProperty(name)) return false;

			return true;
		}
	}

	$class(MemberSpec).extend(z.Base);

	z.MemberSpec = MemberSpec;
});

