var MDelegate = $module({
	onIncluded: function(target) {
		$property(target, "IDelegate", "@R");

		var name = "delegate";
		$property(target, name, "@RW", {
			set: function(o){
				if($support(this.getIDelegate(), o)){
					$property.set(this, "delegate", o);
				}
			}
		})
	},
	includes: {
		delegate: function(name, memberSpec){
			var spec = this.__IDelegate;
			spec.addMember(name, memberSpec);
		},

		callDelegate: function(name, args){
			$fnCall(this.__delegate[name], args, this);
		},

		getMemberOfDelegate: function(name){
			return this.__delegate(name);
		}
	}
});
