export const researchBase = {
	name: "research",
	stack: [
		{ name: "calendar",
		  label: "Calendar",
		  desc: "Discover the world's cyclical cycle.",
		  flavor: null,
		  costs: [
			  { name: "corruption", amount: 10 }
		  ],
		  purchased: false,
		  actions: [
			  { subLabel: "Research",
			    type: "main",
			    press: function(code, isMain = false) {
					devMsg("purchasing research");
					let cal = research.stack[code];
					let getCosts = cal.costs;

					if (resources.checkCostsByArray(getCosts, 0).result == "pass") {
						resources.payCostsByArray(getCosts, 0);
						calendar.activateCal();
						cal.purchased = true;
						buildGrid(research, research.stack, true);
					}
					else if (isMain == true) {
						let target = "research" + code;
						expandButton2(target);
					}
				}
			  }
		  ],
		  effects: [],
		  unlocks: []
		},
		{ name: "stone tools",
		  label: "Stone tools",
		  desc: "Improve hunting and gathering with tools made of stone.",
		  flavor: "sometimes you just have to hit something with a rock.",
		  costs: [
			  { name: "corruption", amount: 15 }
		  ],
		  purchased: false,
		  lockedBy: [
			  { type: "tech", name: "calendar" }
		  ],
		  actions: [],
		  effects: [],
		  unlocks: []
		}

	
	]
};
	
/*

*/

// --- close science object --- //
