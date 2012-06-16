$run(function() {
	eval($global.all);


	var Reflect = $wrapper({
		methods: function(){
			var keys = this.properties();
			var t = this.target;
			return keys.filter(function(k){
				return typeof t[k] == "function";
			});
		},
		properties: function(){
			return Object.keys(this.target);
		},
		ownProperties: function(){
			var keys = this.properties();
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
			var keys = this.properties();
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
		implns: function(){
			return this.target.implns;
		},
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
			return t.__proto__ || t.constructor.prototype;
		}
	});

	$.regist(Reflect, Object, "@reflect");
});
