/**
 * $Object
 * @class
 * @description 对象系统的基础类，建议所有对象都以此类作为超类
 */
$class("$Object", {
	$constructor: function(){
		var props = {}, 
			ps,
			plugins =[],
			plugin;

		this.eachBase(this, function(proto){
			ps = proto.constructor.define.$properties;
			plugin = proto.constructor.define.$plugins;
			if(ps){
				$copy({from:ps, to:props});
			}
			if(plugin){
				Array.prototype.push.apply(plugins, plugin);
			}
		});

		if(props)this.addProperties(props);
		while(plugin=plugins.pop()){
			plugin.call(this);
		}
	},
	$plugins: [function(self){
		console.info("i'm a plugin from $Object");
	}],
	$prototype: {
		addProperties: function(props){
			if(props){
				this.__fields__ = this.__fields__ || {};
				var fields = this.__fields__;
				for(var p in props){
					var rw = props[p].toUpperCase().slice(1,-1);
					var name = p.slice(0,1).toUpperCase() + p.slice(1);
					if(rw.indexOf("R") != -1){
						this["get" + name] = function(){return fields[name];};
					}
					if(rw.indexOf("W") != -1){
						this["set"+ name] = function(value){ fields[name] = value;}
					}
				}
			}
		},
		eachBase: function(self, fn){
			var proto = self.constructor.prototype;
			while(proto){
				fn(proto);
				proto = proto.constructor.baseProto;
			}
		},
		baseCall : function(name){
			var args = $makeArray(arguments, 1);
			var proto;
			if(name === "constructor" || name === "base.constructor"){
				proto = arguments.callee.caller.baseProto;
			}else if(name.indexOf("base.") != -1){
				var uplevel = name.split("base.").length - 1; 
				proto = this.constructor.prototype;
				for(var i=0; i < uplevel && proto; i++){ 
					proto = proto.constructor.baseProto;
				}
				if(proto){ 
					name = name.slice(name.lastIndexOf(".")+1);
				}
			}else{
				proto = this.constructor.baseProto;
			}
			if(proto){
				var member = proto[name];
				if(!member)throw "can't respond to " +'"' + method + '"';
				
				if(typeof member == "function"){
					return member.apply(this, args)
				}else{
					return member;
				}
			}
		},
		mixin: function(module){
			return $mixin(this, module);
		}
	}
});