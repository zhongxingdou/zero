$global.run(function() {
	var IMemberSpec = {
		member: {
			optional: "boolean",
			type: [Array, "string"],
			ownProperty:  "boolean"
		},
		freeze: true
	};

	function $MemberSpec(spec) {
		var self = arguments.callee;

		var t = typeof spec;
		if (t == "string") {
			spec = self.parse(spec);
		}else if($is($Type, spec)){
			spec = {type: spec};
		}

		$merge(arguments.callee.option, spec);

		$copy(spec, this);
	}

	$MemberSpec.option = {
		optional: false,
		type: null,
		ownProperty: false
	}

	$MemberSpec.parse = function(exp) {
		var spec = {};

		var m = exp.match(/^\[(.*)\]$/);
		if (m) {
			spec.optional = true;
			exp = m[1];
		}

		if (exp.indexOf("|") != - 1) {
			spec.type = exp.split("|");
		} else {
			spec.type = exp;
		}

		return spec;
	}

	$MemberSpec.prototype = {
		check: function(o, name) {
			var v = o[name];

			if(v == null){
				return this.optional;
			}


			if (this.type) {
				var t = this.type;
				if ($is(Array, this.type)) {
					var isType = false;
					for (var i = 0, l = t.length; i < l; i++) {
						if ($is(t[i], v)) {
							isType = true;
							break;
						}
					}

					if (!isType) return false;
				} else {
					if (!$is(this.type, v)) return false;
				}
			}

			if (this.ownProperty && ! o.hasOwnProperty(name)) return false;

			return true;
		}
	}

	$global("IMemberSpec", IMemberSpec);
	$global("$MemberSpec", $MemberSpec);
});

