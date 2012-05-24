function $Boolean(bool) {
	this.baseCall("constructor");
	this.setValue(bool);
}

$class($Boolean, {
	base: $Object,
	properties: {
		value: "@RW"
	},
	prototype: {
		valueOf: function() {
			return this.getValue();
		},
		toString: function() {
			return this.getValue().toString();
		},
		then: function(fn) {
			return this.yes.then(fn);
		},
		YES: {
			then: function(fn) {
				var self = this.scope;
				if (self.valueOf()) {
					fn();
				}
				return self;
			}
		},
		NO: {
			then: function(fn) {
				var self = this.scope;
				if (!self.valueOf()) {
					fn();
				}
				return self;
			}
		},
		and: function(bool) {
			this.setValue(this.valueOf() && bool);
			return this;
		},
		or: function(bool) {
			this.setValue(this.valueOf() || bool);
			return this;
		}
	}
});

function boolWrapper(o) {
	return new $Boolean(o);
}

$.regist(boolWrapper, [Boolean, "boolean"]);

