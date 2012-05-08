(function() {
	var IObject = $interface({
		base: IClass,
		member: {
			//在constructor的主体执行完后执行
			plugins: {
				instanceOf: Array
			},
			prototype: {
				//遍历原型链
				eachBase: "function(self, fn)",

				//添加属性
				addProperties: "function(aProps)",

				//调用原型链上的方法
				baseCall: "function(sName)",

				//mixin a module
				mixin: "function(module)"
			}
		}
	});

	function $Object() {
		var props = {},
		ps, plugins = [],
		plugin;

		this.eachBase(this, function(proto) {
			ps = proto.constructor.define.properties;
			plugin = proto.constructor.define.plugins;
			if (ps) {
				$copy(ps, props);
			}
			if (plugin) {
				Array.prototype.push.apply(plugins, plugin);
			}
		});

		if (props) this.addProperties(props);
		while (plugin = plugins.pop()) {
			plugin.call(this);
		}
	}

	/**
	 * $Object
	 * @class
	 * @description 对象系统的基础类，建议所有对象都以此类作为超类
	 */
	$class($Object, {
		plugins: [],
		prototype: {
			addProperties: function(aProps) {
				if (aProps) {
					this.__fields__ = this.__fields__ || {};
					var fields = this.__fields__;
					for (var p in aProps) {
						var rw = aProps[p].toUpperCase();
						var name = p.slice(0, 1).toUpperCase() + p.slice(1);
						if (rw.indexOf("R") != - 1) {
							this["get" + name] = function() {
								return fields[name];
							};
						}
						if (rw.indexOf("W") != - 1) {
							this["set" + name] = function(value) {
								fields[name] = value;
							}
						}
					}
				}
			},
			eachBase: function(self, fn) {
				var proto = self.constructor.prototype;
				while (proto) {
					fn(proto);
					proto = proto.constructor.baseProto;
				}
			},
			baseCall: function(name) {
				var args = $makeArray(arguments, 1);
				var proto;
				if (name === "constructor" || name === "base.constructor") {
					proto = arguments.callee.caller.baseProto;
				} else if (name.indexOf("base.") != - 1) {
					var uplevel = name.split("base.").length - 1;
					proto = this.constructor.prototype;
					for (var i = 0; i < uplevel && proto; i++) {
						proto = proto.constructor.baseProto;
					}
					if (proto) {
						name = name.slice(name.lastIndexOf(".") + 1);
					}
				} else {
					proto = this.constructor.baseProto;
				}
				if (proto) {
					var member = proto[name];
					if (!member) throw "can't respond to " + '"' + method + '"';

					if (typeof member == "function") {
						return member.apply(this, args)
					} else {
						return member;
					}
				}
			},
			mixin: function(module) {
				return $mixin(this, module);
			}
		}
	});

	$global("$Object", $Object);
})();

