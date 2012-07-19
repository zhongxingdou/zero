$run(function(){
	eval($global.all);

	describe("z.MEvent", function(){

		it("addListener(), getListerners()", function(){
			var btn = {};
			$include(z.MEvent, btn);

			var listener = function(){};
			btn.addListener("click", listener); 

			var listeners = btn.getListerners("click");
			expect(listeners).toContain(listener);
		});

		it("removeListener()", function(){
			var btn = {};
			$include(z.MEvent, btn);

			var listener = function(){};
			btn.addListener("click", listener); 
			btn.removeListener("click", listener);

			var listeners = btn.getListerners("click");
			expect(listeners).toNotContain(listener);
		});

		it("fire()", function(){
			var btn = {};
			$include(z.MEvent, btn);

			var listener = jasmine.createSpy();
			btn.addListener("click", listener); 

			var param = [{}];
			btn.fire("click", param);

			expect(listener).toHaveBeenCalledWith(param);
		});
	}); 
});
