const messageArray = [];
let resStatus = "visible"; // temporary variable for dev button testing of hidden attributes.
	
	// ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

// ---- phase 1 buildings based as object ---- //

const swamp = {
	name: "swamp",
	buildings: [
		{ name: "swell",
		  label: "Swell",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 10 }
		  ],
		  ratio: 1.3,
		  onPurchase: function() {
			  this.count += 1;
			  this.updateButtonLabel();
			  this.updateRatio();
			  resources.stack[0].updateGatherRate();
			  resources.stack[0].updateMax();
			  updateContentCosts(0);
		  },
		  updateButtonLabel: function() {
			  let newLabel = this.label;
			  if (this.count > 0) {
				  newLabel = newLabel + " (" + this.count + "m^2)";
			  }
			  document.getElementById(this.name + "Label").innerText = newLabel;
		  },
		  updateRatio: function() {
			  for (let i = 0; i < this.costs.length; i++) {
				  let newAmount = rndPlusThree(this.costs[i].amount * this.ratio);
				  this.costs[i].amount = newAmount;
				  msg("new cost for Swell is " + this.costs[i].amount + " " + this.costs[i].name);
			  }
		  }
		},
		{ name: "pustule",
		  label: "Pustule",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 40 }
		  ],
		  ratio: 1.2
		},
		{ name: "digestor",
		  label: "Digestor",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 20 },
			  { name: "choler", amount: 50 }
		  ],
		  ratio: 1.2
		},
		{ name: "trap",
		  label: "Trap",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 50 },
			  { name: "choler", amount: 20 }
		  ],
		  ratio: 1.2
		},
		{ name: "siren",
		  label: "Siren",
		  count: 0,
		  costs: [],
		  ratio: 1.2
		},
		{ name: "nodule",
		  label: "Nodule",
		  count: 0,
		  costs: [],
		  ratio: 1.2,
		  isUnlocked: false
		}
		],
	buyBuilding: function(num) {
		let validator = checkPrice(num); 
		if (validator == "fail-insufficient") {  // should probably be a switch...
			msg("insufficient resources");
		}
		if (validator == "pass-sufficient") {
			payPrice(num);
			swamp.buildings[num].onPurchase();
		}
	}
}


// ---- end phase 1 buildings ---- //

const resources = {
	name: "resources object",
	stack: [
		{ name: "corruption", // 0
		  label: "Corruption",
		  current: 0,
		  limited: true,
		  isUnlocked: true,
		  max: 50,
		  perTick: 0,
		  gatherRate: 1,
		  gather: function() {
			  let totalRes = this.current;
			  totalRes += this.gatherRate;
			  totalRes = rndPlusThree(totalRes);
			  if (totalRes >= this.max) {
				  this.current = this.max;
			  } else {
				  this.current = totalRes;
			  }
			  resources.loadResource(0); // need to clean up this code
		  },
		  updateGatherRate: function() {
			  this.gatherRate = rndPlusThree(1 + (0.1 * swamp.buildings[0].count));
		  },
// -- updatePerTick is untested -- //	 
		  updatePerTick: function() {
			  this.perTick = 1; // need to define logic.
			  msg("Amount per tick is now " + this.perTick + " per click.");
		  },
		  updateMax: function() {
			  let swl = findBldgInSwamp("swell");
			  let pus = findBldgInSwamp("pustule");
			  let newMax = 50 + (swamp.buildings[swl].count * 5) + (swamp.buildings[pus].count * 50);
			  this.max = newMax;
		  }
		},
		{ name: "prey", // 1
		  label: "Prey",
		  current: 0,
		  limited: true,
		  isUnlocked: true,
		  max: 25,
		  perTick: 0
		},
		{ name: "sustenance", //2
		  label: "Sustenance",
		  current: 0,
		  limited: true,
		  isUnlocked: false,
		  max: 40,
		  perTick: 0,
		  gatherRate: 1,
		  gatherCost: [
			  { name: "prey", amount: 5 }
			  ],
		  gather: function() {
			  let totalRes = this.current;

			  //update target resource
			  totalRes += this.gatherRate;
			  if (totalRes >= this.max) {
				  this.current = this.max;
			  } else {
				  this.current = rndPlusThree(totalRes);
			  }
			  resources.loadResourcePanel(); // need to clean up this code
		  },
		  updateGatherRate: function() {
			  msg("sustenance rate is " + this.gatherRate + " per click. Not yet defined.");
		  },
		  updatePerTick: function() {
			  this.perTick = 1; // need to define logic.
			  msg("Amount per tick is now " + this.perTick + " per click.");
		  },
		},
		{ name: "choler", //3
		  label: "Choler",
		  current: 0,
		  limited: true,
		  isUnlocked: false,
		  max: 150,
		  perTick: 0,
		  gatherRate: 0
		},
		{ name: "native", //4
		  // need to build in way to change based upon phase -- native > subject > citizen > ??
		  label: "Native",
		  current: 0,
		  limited: false,
		  isUnlocked: false
		},
		{ name: "host", //5
		 	// hosts are controllable by the player in phase 2
		  label: "Hosts",
		  current: 0,
		  limited: false,
		  isUnlocked: false
		}
	],
	checkCosts: function(x) {
		let result = { result: "fail", reason: "failed function" };
//		if (!this.stack[x].gatherCost.length > 0) {
		if (this.stack[x].gatherCost === undefined) {
			result = { result: "pass", reason: "no costs" };
			return result;
		}
		let prices = this.stack[x].gatherCost;
		for (let i = 0; i < prices.length; i++) {
			let priceName = prices[i].name;
			let priceCode = resources.findResInStack(priceName);
			let value = prices[i].amount;
			if (value > resources.stack[priceCode].current) {
				result.reason = "insufficient " + priceName;
				return result;
			}
		}
		result.result = "pass";
		result.reason = "sufficient resources";
		return result;	
	},
	findResInStack: function(name) {
		let findName = name;
		for (let i = 0; i < this.stack.length; i++) {
			if (this.stack[i].name == findName) {
				return i;
			}
		}
	},
	gatherByName: function(res) {
		let code = this.findResInStack(res);
		this.gather(code);
	},		
	gather: function(code) {
		let res = this.stack[code];
		let totalRes = res.current;

		//make sure current value is not at maximum
		if (totalRes >= res.max) { 	  
		  return;
		}

		//check if there are costs, and if sufficient resources exist
		let check = this.checkCosts(code);
		if (check.result == "fail") {
			msg("checkCosts failed, " + check.reason);
			return
		}
		if (check.result == "pass") {
			switch (check.reason) {
				case "no costs":
					msg("case no costs");
					break;
				case "sufficient resources":
					//now pay the resource costs
					msg("case sufficient resources");
					let prices = res.gatherCost;
					for (let i = 0; i < prices.length; i++) {
						let priceName = prices[i].name;
						let priceCode = resources.findResInStack(priceName);
						let value = prices[i].amount;
						this.stack[priceCode].current -= value;
					}
					break;
				default:
					msg("something didn't go right in the switch in gather");
			}
			this.stack[code].gather();
		}
		
	},
	loadResource: function(resource) {
		let resName = this.stack[resource].name;
		let resCurrent = rndPlusThree(this.stack[resource].current);

		document.getElementById(resName + 'Current').innerText = resCurrent;
	
		if (this.stack[resource].limited) {
			let resMax = "/" + this.stack[resource].max;
		
			document.getElementById(resName + 'Max').innerText = resMax;
		}
	},
	loadResourcePanel: function() {
		for (let i = 0; i < this.stack.length; i++) {
			let resName = this.stack[i].name;
			let resCurrent = rndPlusThree(this.stack[i].current);

			if (this.stack[i].isUnlocked == false) { // temp to test if identification of locked/unlocked is working
				if (resCurrent > 0) {
					this.stack[i].isUnlocked = true;
					document.getElementById("res" + i + "row").classList.remove("hidden");   // unlock resource if user has any
				} else { 
					continue; } // otherwise, stop the iteration and move on to the next resource
			}
			
			document.getElementById(resName + 'Current').innerText = resCurrent;
		
			if (this.stack[i].limited == true) {
				let resMax = "/" + this.stack[i].max;
			
				document.getElementById(resName + 'Max').innerText = resMax;
			}
		}
	}
} // --- close resources object --- //

function findBldgInSwamp(name) {
	let findName = name;
	for (let i = 0; i < swamp.buildings.length; i++) {
		if (swamp.buildings[i].name == findName) {
			return i;
		}
	}
}

// -- start loading items here -- //

let jsUpdateTime = "11-29 356pm";

// -- end loading items -- //

function updateJStime() {
	loadGame();
	msg("loadGame called via updateJStime");
}
	
function loadGame() {	//runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	resources.loadResourcePanel();
	setDevButtons();
	msg("You have awakened...");
}

function rndPlusThree(number) {
	let numNum = Math.round(number * 1000);
	numNum = numNum / 1000;
	return numNum;
}


// -- button management and purchase code goes here -- //
/* buttons should be in the format XXX-0 or XXX-XXXXX:
 * e.g., gat-0 (gather resource in 0 position in array)
 * or buy-swell (activate purchase code for buying one swell)
 * alternatively, maybe everything is a buy action but some don't have costs?? */

function buttonManager(event) {
//	msg("button pressed");
	let sourceButton = event.target.getAttribute('data-target');
	let actionCat = sourceButton.slice(0 , 3);
	let lvl2 = sourceButton.slice(4);
	let lvl2num = Number(lvl2);	

	if (actionCat == "gat") {
		resources.gather(lvl2num);
	}

	if (actionCat == "dev") {    //-- if dev button, run code from dev button object --//
		dev[lvl2num].run();
	}
	if (actionCat == "buy") {
		swamp.buyBuilding(lvl2num);
	}

}

function checkPrice(num) {
	msg("checkPrice called with num " + num);
	let prices = swamp.buildings[num].costs;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = resources.findResInStack(priceName);
		let value = prices[i].amount;
		if (value > resources.stack[priceCode].current) {
			return "fail-insufficient";
		}
	}
	return "pass-sufficient";
}

function payPrice(num) {
//	msg("payPrice called with num " + num);
	let prices = swamp.buildings[num].costs;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = resources.findResInStack(priceName);
		let value = prices[i].amount;
		resources.stack[priceCode].current -= value;
	}
	resources.loadResourcePanel();
//	msg("payPrice completed");
}

function updateContentCosts(num) {
	msg("updateContentCosts called");
	let prices = swamp.buildings[num].costs;
	let dispCost = "";
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = resources.findResInStack(priceName);
		let label = resources.stack[priceCode].label;
		let value = prices[i].amount;
		dispCost += "<div class=\"bldgCostPriceName\">" + label + ":</div><div class=\"bldgCostRes\">" + value + "</div>";
	}
	document.getElementById("buy-" + num + "-Costs").innerHTML = dispCost;
}

// -- end button management and purchase code --//

// -- calendar object --//

const calendar = {
	currentTime: 0,
	runSpeed: 2000,
	showCal: false,
	day: 0,
	season: 0,
	year: 0,
	daysPerSeason: 90,
	seasonsPerYear: 4,
	seasons: [
		{ name: "spring",
		  label: "Spring",
		  modifiers: null
		},
		{ name: "summer",
		  label: "Summer",
		  modifiers: null
		},
		{ name: "fall",
		  label: "Fall",
		  modifiers: null
		},
		{ name: "winter",
		  label: "Winter",
		  modifiers: null
		}],
	updateCal: function() {
//		msg("updateCal called");
		let newSeason = false;
		let newYear = false;
		
		this.day += 1;
		
		if (this.day >= this.daysPerSeason) {
			this.day -= this.daysPerSeason;
			this.season += 1;
			newSeason = true;
		}
		if (this.season >= this.seasonsPerYear) {
			this.season -= this.seasonsPerYear;
			this.year += 1;
			newYear = true;
		}
		if (newSeason == true) {
			this.onNewSeason();
		}
		if (newYear == true) {
			this.onNewYear();
		} 
		if (this.showCal == true) {
			this.calDisplay();
		}
	},
	onNewSeason: function() {
		msg("onNewSeason triggered");
	},
	onNewYear: function() {
		msg("onNewYear triggered");
	},
	calDisplay: function() {
		let displayDay = this.day + 1;
		let assembledCal = "Day " + displayDay + " of " + this.seasons[this.season].label + ", Year " + this.year;
		document.getElementById("calendarBlock").innerText = assembledCal;
	},
	activateCal: function() {
		this.calDisplay();
		this.showCal = true;
		document.getElementById("calendarBlock").style.display = "block";
	},
	adjustRunSpeed: function() {
		if (this.runSpeed == 4000) {
			this.runSpeed = 500;
		} else {
			this.runSpeed = 4000;
		}
		clearInterval(gameTimer);
		gameTimer = setInterval(tick, this.runSpeed);

	}
}; 

//-- end calendar object --//

//-- start dev object --//

const dev = [
	{ name: "button0",
	  label: "activate calendar",
	  run: function() {  
		  calendar.activateCal();
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button1",
	  label: "force calendar days",
	  run: function() {
		let devForceDay = calendar.daysPerSeason - 5;
		msg("updateCalDev triggered, days set to " + devForceDay);
		calendar.day = devForceDay;
		calendar.calDisplay();
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
 	{ name: "button2",
	  label: "adjust run speed",
	  run: function() {
		  calendar.adjustRunSpeed();
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button3",
	  label: "hide/show all resources",
	  run: function() {
		  //---- save this code for reference for future panel changes --//
		  let resRows = document.getElementsByClassName("resource");
		  if (resStatus == "visible") {
			  for (let i = 0; i < resRows.length; i++) {
				  resRows[i].classList.add("hidden");
				  resStatus = "invisible";
			  }
		  } else {
			  for (let i = 0; i < resources.stack.length; i++) {
				  resources.stack[i].isUnlocked = false;
				  // resRows[i].classList.add("hidden");
				  resStatus = "visible";
			  }
		  }
		  
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	
	{ name: "button4",
	  label: "add prey",
	  run: function() {
		  resources.stack[1].current += 5;
		  resources.loadResource(1);
		  msg("added 5 prey");
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button5",
	  label: "blank",
	  run: function() {},
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
/*	{ name: "button6",
	  label: "blank",
	  run: function() { },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	} */
];

function setDevButtons() {
	for (let i = 0; i < dev.length; i++) {
		dev[i].setLabel();
	}
};


//-- start interval timer --//
//-- this should probably be an object --//

let gameTimer = setInterval(tick, calendar.runSpeed);

function tick() {
//	msg("tick");
	resources.loadResourcePanel();
	calendar.updateCal();
}

//-- end interval timer --//

function toggleActive(e) {
	const targetPanelId = e.target.getAttribute('data-target');
	const targetPanel = document.getElementById(targetPanelId);
	const activePanels = document.getElementsByClassName('active');
	if (activePanels) {
		activePanels[0].classList.toggle('active'); /* hides everything */
	} 
	targetPanel.classList.toggle('active')
}


function expandButton(butt) {
	const target = butt.target.getAttribute('data-target');
	const targetContent = document.getElementById(target + "-content");
	const targetButton = document.getElementById(target + "-collapsible");
	
	if (targetContent.style.display == "block") {
		targetContent.style.display = "none"; /* hide content DIV */
		targetButton.style.borderBottom = "1px solid black"; /* restore border */	
		targetButton.style.borderRadius = "10px"; /* restore rounded corners */	
		targetContent.style.maxHeight = "0";

	} else {
		targetContent.style.display = "block";
		targetContent.style.maxHeight = targetContent.scrollHeight + "px";
		targetButton.style.borderBottom = "none";
		targetButton.style.borderRadius = "10px 10px 0 0";
	}
}

function msg(messagetext) {
	messageArray.unshift(messagetext);
	if (messageArray.length > 25) {
		messageArray.pop();
	}
	let finalArray = "";
	for (let i = 0; i < messageArray.length; i++) {
		finalArray += "<p>" + messageArray[i] + "</p>";
	}
	document.getElementById("messagebox").innerHTML = finalArray;
}

	
