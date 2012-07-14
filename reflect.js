$run(function() {
	eval($global.all);

	var Inspect = $module({
		methods: function(){
			var keys = this.keys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] == "function";
			});
		},
		properties: function(){
			return Object.getOwnPropertyNames(this.target);
		},
		keys: function(){
			return $keys(this.target);
		},
		ownKeys: function(){
			return Object.keys(this.target);
		},
		ownProperties: function(){
			var keys = this.keys();
			var t = this.target;
			return keys.forEach(function(k){
				return t.hasOwnProperty(k);
			});
		},
		publicMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return !$isPrivate(k);
			});
		},
		privateMethods: function(){
			var keys = this.methods();
			return keys.filter(function(k){
				return $isPrivate(k);
			});
		},
		fields: function(){
			var keys = this.keys();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] != "function";
			});
		},
		publicFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return !$isPrivate(k);
			});
		},
		privateFields: function(){
			var keys = this.fields();
			return keys.filter(function(k){
				return $isPrivate(k);
			});
		},
		type: function(){
			return typeof this.target;
		},
		/*
		implementations: function(){
			var ar = [];
			var t = this.target;

			if(t.implns){ 
				ar = ar.concat(t.implns); 
			}

			var implns = t.consturctor.implns;
			if(implns){
				ar = ar.concat(implns);
			}
			return ar;
		},
		*/
		creator: function(){
			return this.target.constructor;
		},
		protoLink: function(){
			var protos = [];
			$traceProto(this.target, function(p){
				protos.push(p);
			});
			return protos;
		},
		proto: function(){
			var t = this.target;
			var supportedProto = {}.__proto__ !== undefined;
			return supportedProto ? t.__proto__ : t.constructor.prototype;
		}
	});

	$.regist(Inspect, Object, "@inspect");

	function $inspect(o){
		return $(o).wrap("@inspect");
	} 

	$global("$inspect", $inspect);
});

