let food = 0;
const messageArray = ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

// ---- phase 1 buildings, replace with object stack later ---- //

const swampBuildings = [
	{ name: "swell",
	  label: "Swell",
	  count: 0,
	  costs: [
		  { name: "corruption", amount: 10 }
		  ],
	  ratio: 1.2,
	  onPurchase: function() {
		  msg("onPurchase called");
		  this.count += 1;
		  msg("current count: " + this.count);
		  this.updateButtonLabel();
		  this.updateRatio();
		  resourceStack[0].updateGatherRate();
		  resourceStack[1].gather();
	  },
	  updateButtonLabel: function() {
		  msg("updateButtonLabel called for swell");
		  let newLabel = this.label;
		  if (this.count > 0) {
			  newLabel = newLabel + " (" + this.count + ")";
		  }
		  document.getElementById(this.name + "Label").innerText = newLabel;
	  },
	  updateRatio: function() {
		  msg("updateRatio called for Swell");
		  for (let i = 0; i < this.costs.length; i++) {
			  let newAmount = Math.round(this.costs[i].amount * this.ratio * 1000) / 1000;
			  msg("rounded to " + newAmount);
			  this.costs[i].amount = newAmount;
			  msg("new cost for Swell is " + this.costs[i].amount + " " + this.costs[i].name);
		  }
	  }
	},
	{ name: "pustule",
	  label: "Pustule",
	  count: 0,
	  costs: [],
	  ratio: 1.2
	},
	{ name: "digestor",
	  label: "Digestor",
	  count: 0,
	  costs: [],
	  ratio: 1.2
	},
	{ name: "trap",
	  label: "Trap",
	  count: 0,
	  costs: [],
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
	msg("findResInStack called for " + name);
	for (let i = 0; i < resourceStack.length; i++) {
		if (resourceStack[i].name == findName) {
			msg("found " + name + " in array index " + i);
			return i;
		}
		msg("did not find " + name + " in array index " + i);
	}
}
	
const resourceStack = [
	{ name: "corruption", // 0
	  label: "Corruption",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0,
	  gatherRate: 1,
	  gather: function() {
		  let totalRes = this.current;
		  totalRes += this.gatherRate;
		  if (totalRes >= this.max) {
			  this.current = this.max;
		  } else {
			  this.current = totalRes;
		  }
		  loadResource(0); // need to clean up this code
	  },
// -- updateGatherRate and updatePerTick are untested -- //	 
	  updateGatherRate: function() {
		  this.gatherRate = Math.round((1 + (0.1 * swampBuildings[0].count)) * 10)/10;
		  msg("Amount per fester is now " + this.gatherRate + " per click.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  msg("Amount per tick is now " + this.perTick + " per click.");
	  }
	},
	{ name: "size", // 1
	  label: "Size",
	  current: 1,
	  limited: false,
	  perTick: 0,
	  gather: function() {
		  this.current = 1 + swampBuildings[0].count;
		  loadResource(1);
	  }
	},
	{ name: "prey", // 2
	  label: "Prey",
	  current: 0,
	  limited: true,
	  max: 25,
	  perTick: 0
	},
	{ name: "sustenance", //3
	  label: "Sustenance",
	  current: 0,
	  limited: true,
	  max: 40,
	  perTick: 0,
	  gatherRate: 1,
	  gatherCost: 1, // replace with object with resource names, costs 
	  gather: function() {
		  let totalRes = this.current;
		  totalRes += this.gatherRate;
		  if (totalRes >= this.max) {
			  this.current = this.max;
		  } else {
			  this.current = totalRes;
		  }
		  loadResource(3); // need to clean up this code
	  },
	  updateGatherRate: function() {
		  msg("sustanenance rate is " + this.gatherRate + " per click. Not yet defined.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  msg("Amount per tick is now " + this.perTick + " per click.");
	  } 	 
	}
];

// -- start loading items here -- //

let jsUpdateTime = "11-9 1103am";

// -- end loading items -- //

function updateJStime() { //runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	document.getElementById('messageCurrent').innerText = messageArray.toString();
	loadResourcePanel();
}

function loadResource(resource) {
	let resName = resourceStack[resource].name;
	let resCurrent = resourceStack[resource].current;

	document.getElementById(resName + 'Current').innerText = resCurrent;
	
	if (resourceStack[resource].limited) {
		let resMax = "/" + resourceStack[resource].max;
		
		document.getElementById(resName + 'Max').innerText = resMax;
	}
}

function loadResourcePanel() {
	for (let i = 0; i < resourceStack.length; i++) {
		let resName = resourceStack[i].name;
		let resCurrent = resourceStack[i].current;
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
	msg("button pressed");
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
	msg("buyBuilding function complete");
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
	msg("payPrice called with num " + num);
	let prices = swampBuildings[num].costs;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = findResInStack(priceName);
		let value = prices[i].amount;
		resourceStack[priceCode].current -= value;
	}
	loadResourcePanel();
	msg("payPrice completed");
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
		if (this.runSpeed == 2000) {
			this.runSpeed = 500;
		} else {
			this.runSpeed = 2000;
		}
		clearInterval(gameTimer);
		gameTimer = setInterval(tick, this.runSpeed);

	}
}; 

//-- end calendar object --//

//-- start dev object --//

const dev = [
	{ name: "button0",
	  run: function() {  
		  calendar.activateCal();
	  } 
	},
	{ name: "button1",
	  run: function() {
		let devForceDay = calendar.daysPerSeason - 5;
		msg("updateCalDev triggered, days set to " + devForceDay);
		calendar.day = devForceDay;
		calendar.calDisplay();
	  }
	},
	{ name: "button2",
	  run: function() {
		  calendar.adjustRunSpeed();
	  }
	},
	{ name: "button3",
	  run: function() {
		  let george = "prey";
		  let bob = findResInStack(george);
		  msg("found " + george + " in index " + bob);
	  }
	},
	{ name: "button4",
	  run: function() {
		  msg("no function defined for devbutton 4");
	  }
	}
];

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
	const buttonElement = butt.target.getAttribute('data-target');
	const targetContent = document.getElementById(buttonElement + "Content");
	if (targetContent.style.display == "block") {
		targetContent.style.display = "none"; /* hide content DIV */
		document.getElementById(buttonElement).style.borderBottom = "1px solid black"; /* restore border */	
		document.getElementById(buttonElement).style.borderRadius = "10px"; /* restore rounded corners */	
		targetContent.style.maxHeight = "0";

	} else {
		targetContent.style.display = "block";
		targetContent.style.maxHeight = targetContent.scrollHeight + "px";
		document.getElementById(buttonElement).style.borderBottom = "none";
		document.getElementById(buttonElement).style.borderRadius = "10px 10px 0 0";	
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

	
