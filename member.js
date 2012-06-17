$run(function() {
	eval($global.all);

	/**
	 * @todo 缓存常见的MemberSpec
	 * @todo 缓存一个接口中重复的
	 */
	var IMemberSpecOption = {
		member: {
			required: "boolean",
			type: [Array, ITypeSpec],
			ownProperty:  "boolean"
		},
		freeze: false
	};

	function MemberSpec(spec) {
		if(spec instanceof MemberSpec){
				return spec;
		}

		var self = arguments.callee;

		var t = typeof spec;
		if (t == "string") {
			self.__parse(spec, this);
		}else if(t == "object"){
			$merge(spec, this);
		}else if(t == "function"){
			this.type = spec;
		}

		$merge(arguments.callee.option, this);
	}

	MemberSpec.option = {
		required: false,
		type: null,
		ownProperty: false
	}

	MemberSpec.__parse = function(exp, spec) {
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

	//$global("IMemberSpec", IMemberSpec);
	$global("MemberSpec", MemberSpec);
});

