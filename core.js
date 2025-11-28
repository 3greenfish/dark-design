const messageArray = [];
let resStatus = "visible"; // temporary variable for dev button testing of hidden attributes.
	
	// ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

// ---- phase 1 buildings, replace with object stack later ---- //

class testClass {
	constructor() {
		this.name = "bob";
		this.testArray = [	
			{ name: "testing 1", value: 17 },
			{ name: "testing 2", value: 38 }
		];
	}
	onTestCall() {
		this.testArray[0].value += 1;
		msg("successfully called onTestCall. Value of testArray 0 is now " + testArray[0].value);
	}
	wipe() {
		this = {};
	}
}

const bollocks = new testClass();

const swampBuildings = [
	{ name: "swell",
	  label: "Swell",
	  count: 0,
	  costs: [
		  { name: "corruption", amount: 10 }
		  ],
	  ratio: 1.3,
	  onPurchase: function() {
		  this.count += 1;
		  msg("current count: " + this.count);
		  this.updateButtonLabel();
		  this.updateRatio();
		  resourceStack[0].updateGatherRate();
		  resourceStack[0].updateMax();
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
	}
];


// ---- end phase 1 buildings ---- //

function findResInStack(name) {
	let findName = name;
//	msg("findResInStack called for " + name);
	for (let i = 0; i < resourceStack.length; i++) {
		if (resourceStack[i].name == findName) {
//			msg("found " + name + " in array index " + i);
			return i;
		}
//		msg("did not find " + name + " in array index " + i);
	}
}

function findBldgInSwamp(name) {
	let findName = name;
	for (let i = 0; i < swampBuildings.length; i++) {
		if (swampBuildings[i].name == findName) {
			return i;
		}
	}
}

const resourceStack = [
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
		  loadResource(0); // need to clean up this code
	  },
	  updateGatherRate: function() {
		  this.gatherRate = rndPlusThree(1 + (0.1 * swampBuildings[0].count));
	  },
// -- updatePerTick is untested -- //	 
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  msg("Amount per tick is now " + this.perTick + " per click.");
	  },
	  updateMax: function() {
		  let swl = findBldgInSwamp("swell");
		  let pus = findBldgInSwamp("pustule");
		  msg("swl is " + swl + ", and pus is " + pus);
		  let newMax = 50 + (swampBuildings[swl].count * 5) + (swampBuildings[pus].count * 50);
		  this.max = newMax;
		  msg("new maximum is logged as " + this.max);
	  }
	},
/*	{ name: "size", // 1
	  label: "Size",
	  current: 1,
	  limited: false,
	  isUnlocked: true,
	  perTick: 0,
	  gather: function() {
		  this.current = 1 + swampBuildings[0].count;
		  loadResource(1);
	  }
	}, */
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
		//make sure current value is not at maximum
		  if (totalRes >= this.max) { 
			  msg("current resource is " + totalRes + ", which is the maximum for this resource.");		  
			  return;
		  }

		//verify sufficient resources to perform action
		  let priceCheck = this.checkCosts(); 
		  if (priceCheck == "fail-insufficient") {
			  msg("insufficient base resource to perform action");
			  return;
		  }
		//pay the cost in each source resource
		  let prices = this.gatherCost;
		  for (let i = 0; i < prices.length; i++) {
			  let priceName = prices[i].name;
			  let priceCode = findResInStack(priceName);
			  let value = prices[i].amount;
			  resourceStack[priceCode].current -= value;
		  }
		//update target resource
		  totalRes += this.gatherRate;
		  if (totalRes >= this.max) {
			  this.current = this.max;
		  } else {
			  this.current = totalRes;
		  }
		  loadResourcePanel(); // need to clean up this code
	  },
	  updateGatherRate: function() {
		  msg("sustanenance rate is " + this.gatherRate + " per click. Not yet defined.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  msg("Amount per tick is now " + this.perTick + " per click.");
	  },
	  checkCosts: function() {
		  let prices = this.gatherCost;
		  for (let i = 0; i < prices.length; i++) {
			  let priceName = prices[i].name;
			  let priceCode = findResInStack(priceName);
			  let value = prices[i].amount;
			  if (value > resourceStack[priceCode].current) {
				  return "fail-insufficient";
			  }
			  return "pass-sufficient";
		  }
	  }  
	},
	{ name: "choler", //3
	  label: "Choler",
	  current: 0,
	  limited: true,
	  isUnlocked: false,
	  max: 150,
	  perTick: 0,
	  gatherRate: 0
	}
];

// -- start loading items here -- //

let jsUpdateTime = "11-9 1103am";

// -- end loading items -- //

function updateJStime() { //runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	msg("You have awakened...");
//	document.getElementById('messageCurrent').innerText = messageArray.toString();
	loadResourcePanel();
	setDevButtons();
}

function rndPlusThree(number) {
	let numNum = Math.round(number * 1000);
	numNum = numNum / 1000;
	return numNum;
}

function loadResource(resource) {
	let resName = resourceStack[resource].name;
	let resCurrent = rndPlusThree(resourceStack[resource].current);

	document.getElementById(resName + 'Current').innerText = resCurrent;
	
	if (resourceStack[resource].limited) {
		let resMax = "/" + resourceStack[resource].max;
		
		document.getElementById(resName + 'Max').innerText = resMax;
	}
}

function loadResourcePanel() {
	for (let i = 0; i < resourceStack.length; i++) {
		let resName = resourceStack[i].name;
		let resCurrent = rndPlusThree(resourceStack[i].current);

		if (resourceStack[i].isUnlocked == false) { // temp to test if identification of locked/unlocked is working
			if (resCurrent > 0) {
				resourceStack[i].isUnlocked = true;
				document.getElementById("res" + i + "row").classList.remove("hidden");   // unlock resource if user has any
			} else { 
				continue; } // otherwise, stop the iteration and move on to the next resource
		}
		
/*		if (resName == "size") {
			resCurrent += "m^2";
		} */
		document.getElementById(resName + 'Current').innerText = resCurrent;
		
		if (resourceStack[i].limited == true) {
			let resMax = "/" + resourceStack[i].max;
			
			document.getElementById(resName + 'Max').innerText = resMax;
		}
	}
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
		resourceStack[lvl2num].gather();
	}

	if (actionCat == "dev") {    //-- if dev button, run code from dev button object --//
		dev[lvl2num].run();
	}
	if (actionCat == "buy") {
		buyBuilding(lvl2num);
	}

}

function buyBuilding(num) {
	let validator = checkPrice(num); 
	if (validator == "fail-insufficient") {  // should probably be a switch...
		msg("insufficient resources");
	}
	if (validator == "pass-sufficient") {
		payPrice(num);
		swampBuildings[num].onPurchase();
	}
//	msg("buyBuilding function complete");
}

function checkPrice(num) {
	msg("checkPrice called with num " + num);
	let prices = swampBuildings[num].costs;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = findResInStack(priceName);
		let value = prices[i].amount;
		if (value > resourceStack[priceCode].current) {
			return "fail-insufficient";
		}
	}
	return "pass-sufficient";
}

function payPrice(num) {
//	msg("payPrice called with num " + num);
	let prices = swampBuildings[num].costs;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = findResInStack(priceName);
		let value = prices[i].amount;
		resourceStack[priceCode].current -= value;
	}
	loadResourcePanel();
//	msg("payPrice completed");
}

function updateContentCosts(num) {
	msg("updateContentCosts called");
	let prices = swampBuildings[num].costs;
	let dispCost = "";
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = findResInStack(priceName);
		let label = resourceStack[priceCode].label;
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
/*	{ name: "button1",
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
	}, */
 	{ name: "button1",
	  label: "adjust run speed",
	  run: function() {
		  calendar.adjustRunSpeed();
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button2",
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
			  for (let i = 0; i < resourceStack.length; i++) {
				  resourceStack[i].isUnlocked = false;
				  // resRows[i].classList.add("hidden");
				  resStatus = "visible";
			  }
		  }
		  
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	
	{ name: "button3",
	  label: "add prey",
	  run: function() {
		  resourceStack[1].current += 5;
		  loadResource(1);
		  msg("added 5 prey");
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button4",
	  label: "wipe class",
	  run: function() {
		  bollocks.wipe();
		  bollocks.onTestCall();
		  bollocks = new testClass();
		  msg("done");
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	},
	{ name: "button5",
	  label: "test new class thing",
	  run: function() {
		  bollocks.onTestCall();
//		    msg("no function defined for devbutton");
	  },
	  setLabel: function() {
		  document.getElementById("dev" + this.name).innerText = this.label;
	  }
	}
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
	loadResourcePanel();
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

	
