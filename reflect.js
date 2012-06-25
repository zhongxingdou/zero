$run(function() {
	eval($global.all);

	var Inspect = $module({
		methods: function(){
			var allKeys = this.allKeys();
			var t = this.target;
			return allKeys.filter(function(k){
				return typeof t[k] == "function";
			});
		},
		properties: function(){
			return Object.getOwnPropertyNames(this.target);
		},
		allKeys: function(){
			return $allKeys(this.target);
		},
		ownKeys: function(){
			return Object.keys(this.target);
		},
		ownProperties: function(){
			var allKeys = this.allKeys();
			var t = this.target;
			return allKeys.forEach(function(k){
				return t.hasOwnProperty(k);
			});
		},
		publicMethods: function(){
			var allKeys = this.methods();
			return allKeys.filter(function(k){
				return !$isPrivate(k);
			});
		},
		privateMethods: function(){
			var allKeys = this.methods();
			return allKeys.filter(function(k){
				return $isPrivate(k);
			});
		},
		fields: function(){
			var allKeys = this.allKeys();
			var t = this.target;
			return allKeys.filter(function(k){
				return typeof t[k] != "function";
			});
		},
		publicFields: function(){
			var allKeys = this.fields();
			return allKeys.filter(function(k){
				return !$isPrivate(k);
			});
		},
		privateFields: function(){
			var allKeys = this.fields();
			return allKeys.filter(function(k){
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
		return $(o).wrapWith("@inspect");
	} 

	$global("$inspect", $inspect);
});

