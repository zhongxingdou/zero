$run(function(){
	eval($global.all);

	describe("event.js MEvent", function(){

		it("addListener(), getListerners()", function(){
			var btn = {};
			MEvent.mixTo(btn);

			var listener = function(){};
			btn.addListener("click", listener); 

			var listeners = btn.getListerners("click");
			expect(listeners).toContain(listener);
		});

		it("removeListener()", function(){
			var btn = {};
			MEvent.mixTo(btn);

			var listener = function(){};
			btn.addListener("click", listener); 
			btn.removeListener("click", listener);

			var listeners = btn.getListerners("click");
			expect(listeners).toNotContain(listener);
		});

		it("fire()", function(){
			var btn = {};
			MEvent.mixTo(btn);

			var listener = jasmine.createSpy();
			btn.addListener("click", listener); 

			var param = [{}];
			btn.fire("click", param);

			expect(listener).toHaveBeenCalledWith(param);
		});
	}); 
});
