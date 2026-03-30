const messageArray = [];
let devMode = false;
	// ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

let resStatus = "visible"; // FLAG temporary variable for dev button testing of hidden attributes.

// TESTING NEW OBJECT and LOCAL STORAGE //

function objectParseMsg(ob) {
	let output = "";
	for (let [property, value] of Object.entries(ob)) {
		output += property + ": " + value + "<br/>";
	}
	msg(output);
}

// --- BUILD GRID FUNCTION --- //
//this is a loop that cycles through the applicable button array, determines content for each button, decides which column the button goes into, adds it to the column, assembles a block of HTML, and outputs it to the parent container.

/*
<div class="buttonContainer">
					<div class="collapsible" id="buy-1-collapsible">
						<div class="buttonLabelWithBar" data-target="buy-1" id="pustuleLabel" onClick="buttonManager(event)">Pustule</div><div class="notch" data-target="buy-1" onClick="expandButton(event)">&#9776;</div>
						<div class="buttonBarContainer">
							<div id="pustuleProgress"></div>
						</div>
					</div>
					<div class="content" id="buy-1-content">
						<p>Grow a pustule to process sustenance into a thick bile.</p>
						<p>Once full, pustules generate corruption, and can be popped for choler.</p>
						<hr>
						<div class="costs" id="buy-1-Costs">
							<div class="bldgCostPriceName">RESOURCE</div><div class="bldgCostRes">DEFAULT AMOUNT</div>
						</div>
						<div class="button" data-target="buy-1" onClick="buttonManager(event)">Grow Pustule</div>
						<div class="button" data-target="pop-1" onClick="buttonManager(event)">Pop</div>
						<div class="button" data-target="pop-all" onClick="buttonManager(event)">Pop all</div>
					</div>
				</div>



*/



function buildGrid(source, sourceArray, refresh = false) {
	let output = "";
	let numColumns = 3; // FLAG -- plan to change this to check settings once screen size is evaluated //
	let columns = [];
	let currentColumn = 0;
	let array = [];
	
	for (let c = 0; c < numColumns; c++) {
		columns[c] = `<div class="buttonColumn" id="buttonColumn${c}">`;
	}

	if (!sourceArray) {
		array = [{ label: "no source array" },{ label: "have a button anyway" }];
	} else {
		array = sourceArray;
	}

	let openArray = (refresh == true) ? logOpenTabs(source, sourceArray) : "";
		
	for (let i = 0; i < array.length; i++) {		//for every button in stack

		// IF test to check if hidden or blocked, then continue FOR loop.
		
		let label = array[i].label;		//this is what shows in the label, will need to be updated for counts
		if (array[i].count > 0) {
			let act = (array[i].inactive > 0) ? array[i].count - array[i].inactive + "/" : "";
			label = label + " (" + act + array[i].count + ")";
		}					//FLAG -- make this into a separate function that accounts for active/inactive buildings		
		let identifier = source.name + i;
		let desc = array[i].desc;		//gets description from stack
		let cost = "";

		let AC = ""; //variable to flag active class
		if (array[i].costs) {
			devMsg("BuildGrid reached getContentCosts");
			let costs = getContentCosts(source, i);
			cost = `
					<hr>
						<div class="costs" id="${identifier}Costs">
							${costs}
						</div>`;
			if (resources.checkCostsByArray(array[i].costs, array[i].count).result == "pass") {
				AC = "active";
			}
		} 

		let actionsArray = array[i].actions;
		let actions = "";
		for (let a = 0; a < actionsArray.length; a++) {
			let sub = actionsArray[a].subLabel;
			let buttonCode = `${source.name}.stack[${i}].actions[${a}].press(${i})`;
			actions += `<div class="button" onClick="${buttonCode}">${sub}</div>`;
		}

		let mainActionCode = `${source.name}.stack[${i}].actions[0].press(${i},true)`;

		let newButton = `
				<div class="buttonContainer">
					<div class="collapsible ${AC}" id="${identifier}Collapsible">
						<div class="buttonLabel" data-target="${identifier}" id="${identifier}Label" onClick="${mainActionCode}">${label}</div><div class="notch" data-target="${identifier}" onClick="expandButton2('${identifier}')">&#9776;</div>
						<div class="buttonBarContainer">
							<div id="${identifier}Progress"></div>
						</div>
					</div>
					<div class="content" id="${identifier}Content">
						<p>${desc}</p>
						${cost}
						${actions}
					</div>
				</div>`;
		columns[currentColumn] += newButton;
		currentColumn += 1;
		if (currentColumn >= numColumns) { 
			currentColumn = 0;
		}
	}

	for (let c = 0; c < columns.length; c++) {
		columns[c] += `</div>`;
		output += columns[c];
	}
	document.getElementById("fillGrid").innerHTML = output;
	if (refresh == true) {
		reopenTabs(source, openArray);
	}

}	

function logOpenTabs(source, sourceArray) {
	let array = [];
	for (let i = 0; i < sourceArray.length; i++) {
		let iteration = (document.getElementById(source.name + i + "Content").style.display == "block") ? true : false;
		array.push(iteration);
	}
	return array;
}

function reopenTabs(source, array) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == true) { expandForce(source.name + i); }
	}

}



// --- basic game information saved in object --- //

const game = {};
const gameBase = {
	currentPhase: 0,
	phases: [
		{ name: "swamp" },
		{ name: "tribe" },
		{ name: "city" },
		{ name: "nation" },
		{ name: "world" },
		{ name: "space" }
		],
	activeTab: 0,
	tabs: [
		{ name: "swamp", 
		  label: "a sinister swamp",
		  visible: true,
		  lockAtPhase: 1,
		  select: function(num) {
			  game.activeTab = num;
			  game.refreshNav();
			  devMsg(this.name + " selected");
			  buildGrid(swamp, swamp.stack);
		  }
		},
		{ name: "personnel",
		  get label() {
			  let label2 = "";
			  switch(game.currentPhase) {
				  case 0:
					  label2 = "ERROR";
					  break;
				  case 1:
					  label2 = "tribe";
					  break;
				  case 2:
					  label2 = "residents";
					  break;
				  case 3:
					  label2 = "citizens";
					  break;
				  case 4:
					  label2 = "population";
				  default:
					  label2 = "error";
			  }
			  return label2;
		  },
//		  label: "tribe",
		  unlockAtPhase: 1,
		  select: function(num) {
			  game.activeTab = num;
			  game.refreshNav();
			  devMsg(this.name + " selected");
		  }
		},
		{ name: "home",
		  label: "settlement",
		  unlockAtPhase: 2,
		  select: function(num) {
			  game.activeTab = num;
			  game.refreshNav();
			  devMsg(this.name + " selected");
		  }
		},
		{ name: "world",
		  label: "world", // update to start as "nearby towns"?
		  unlockAtPhase: 3,
		  select: function(num) {
			  game.activeTab = num;
			  game.refreshNav();
			  devMsg(this.name + " selected");
		  }
		},
		{ name: "research",
		  label: "research",
		  select: function(num) {
			  game.activeTab = num;
			  game.refreshNav();
			  devMsg(this.name + " selected");
		  }
		}
		],
	buildNav: function() {
		let navList = "";
		for (let i = 0; i < this.tabs.length; i++) {
			let tabLabel = this.tabs[i].label;
			let activeFlag = "";
			let action = `game.tabs[${i}].select(${i})`;
			if (this.activeTab == i) {
				activeFlag = `class="activeTab"`;
			}
			let newLabel = "";
			if (navList != "") {
				newLabel = " | ";
			}
			newLabel += `<div ${activeFlag} onClick="${action}" id="tab${i}">${tabLabel}</div>`;
			navList += newLabel;
		}
		document.getElementById("tabNav").innerHTML = navList;
	},
	refreshNav: function() {
		for (let i = 0; i < this.tabs.length; i++) {
			let element = document.getElementById("tab" + i);
			if (element.classList.contains("activeTab")) {
				element.classList.remove("activeTab");
			}
		}
		document.getElementById("tab" + this.activeTab).classList.add("activeTab");
	}
};

// ---- phase 1 buttons based as object ---- //

		 /*

		 Each button has actions in an array.
		 The first action is ALWAYS the main button, and should incorporate code to alternately check whether
		 	a. costs exist
			b. costs can be paid
		 if costs can't be paid, expand button

		 actions has following properties:
		 	subLabel: what shows on the button when expanded. For main button, overwritten by label in parent.
			type: main, maybe like a side-by-side button thing?
			press: calls a function when the button is pressed.
				code: this is built into the button to facilitate calling parent items.
				isMain: defaults to false. Will be true for main buttons, can be used to expand/close collapsible.


			  { subLabel: "",
			    type: "",
				press: function(code, isMain = false) { 
				}
			  }
		 

		 */

const swamp = {};
const swampBase = {
	name: "swamp",
	stack: [
		{ name: "fester",	//0
		  label: "Fester",
		  type: "gather",
		  desc: "Fester in darkness to build up Corruption.",
		  flavor: "",
		  actions: [
			  { subLabel: "Fester",
			    type: "main", 
			    press: function(code, isMain = false) {
					let r = resources.findResInStack("corruption");
					let a = resources.stack[r].gatherRate;
					resources.addRes(r, a);

					devMsg("code is " + code + ", isMain is " + isMain);
				}
			  }
		  ]
		},
		{ name: "ensnare",	//1
		  label: "Ensnare prey",
		  type: "gather",
		  desc: "Attempt to catch unsuspecting creatures to use as fuel.",
		  flavor: "",
		  actions: [
			  { subLabel: "Ensnare",
			    type: "main",
			    press: function(code, isMain = false) {
					let r = resources.findResInStack("prey");
					let res = resources.stack[r];
					let ch = res.gatherChance; // FLAG FOR CALCULATION
					if (resources.canAddAnyRes(r) == true ) {
						if (ch >= Math.random()) {
							let amountCaught = 1;		//FLAG FOR UPDATING BY CALCULATION
							resources.addRes(r, amountCaught);
							msg("Prey captured!");
						} else {
							msg("You have failed to capture any prey.");
						}
					}
					else if (isMain == true) {			//expand or close button
						devMsg("isMain is TRUE, calling expandButton2");
						let target = "swamp" + code;
						expandButton2(target);
					}
				}
			  }
		  ]
		},
		{ name: "digest",	//2
		  label: "Digest prey",
		  type: "gather",
		  desc: "Process captured prey to generate Sustenance.",
		  costs: [
			  { name: "prey", amount: 2 }
		  ],
		  actions: [
			  { subLabel: "Digest prey",
			    type: "main",
			    press: function(code, isMain = false) {
					devMsg("Digest button called");
					let getCosts = swamp.stack[code].costs;
					devMsg("loaded getCosts");					
					if (resources.checkCostsByArray(getCosts).result == "pass" && resources.canAddAnyRes("sustenance")) {
						devMsg("checked costs, checked to add res");
						resources.payCostsByArray(getCosts);
						let r = resources.findResInStack("sustenance");
						let a = 1;
						resources.addRes(r, a);
					} else if (isMain == true) {
						//expand or close button
						devMsg("isMain is TRUE, calling expandButton2");
						let target = "swamp" + code;
						expandButton2(target);
					}
				}
			  }
		  ]
		},
		{ name: "swell",    //3
		  label: "Swell",
		  desc: "A burgeoning swamp expands Corruption limits and enhances Festering.",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 10, ratio: 1.3 }
		  ],
		  actions: [
			  { subLabel: "Swell by 1m^2",
			    type: "main",
			    press: function(code, isMain = false) {
					devMsg("buy swell called");
					let swell = swamp.stack[code];
					let getCosts = swell.costs;
					let current = swell.count;
					devMsg("swell getCosts called");

					if (resources.checkCostsByArray(getCosts, current).result == "pass") {
						resources.payCostsByArray(getCosts, current);
						swell.count += 1;

						updateLabel(swamp, code);
						updateContentCosts2(swamp, code);
					}
					else if (isMain == true) {
						//expand or close button
						devMsg("isMain is TRUE, calling expandButton2");
						let target = "swamp" + code;
						expandButton2(target);
					}					
				}
			  }
		  ],
		  effects: [
			  { stack: "resource", res: "corruption", type: "perClick", amount: 0.1, source: "swamp", button: "swell" },
			  { stack: "resource", res: "corruption", type: "max", amount: 5, source: "swamp", button: "swell" }
		  ],
		  unlocks: [],
		  lockedBy: []
		},
		{ name: "pustule",     //4
		  label: "Pustule",
		  desc: `Pustules process Sustenance into a thick bile.</p><p>
Once full, pustules generate Corruption, and can be popped for Choler.`,
		  get count() {
			  console.log("getting pustule count");
			  return this.filled + this.unfilled.length;
		  },
		  get inactive() {
			  return this.unfilled.length;
		  },
		  costs: [
			  { name: "corruption", amount: 40, ratio: 1.2 }
		  ],
//		  ratio: 1.2,
		  actions: [
			  { subLabel: "Grow pustule",
			    type: "main",
			    press: function(code, isMain = false) {
					devMsg("buy pustule called");
					let grow = swamp.stack[code];
					let getCosts = grow.costs;
					let current = grow.count;
					devMsg("pustule getCosts called");

					if (resources.checkCostsByArray(getCosts, current).result == "pass") {
						resources.payCostsByArray(getCosts, current);

						grow.unfilled.push({ level: 12 });

						updateLabel(swamp, code);
						updateContentCosts2(swamp, code);
					}
					else if (isMain == true) {
						//expand or close button
						devMsg("isMain is TRUE, calling expandButton2");
						let target = "swamp" + code;
						expandButton2(target);
					}
				}
			  },
			  { subLabel: "Pop",
			    type: "",
			    press: function(code) {}
			  },
			  { subLabel: "Pop all",
			    type: "",
			    press: function(code) {
					let count = swamp.stack[code].filled;

					// call pop pustule code? check for amount fillable?
				}
			  }
		  ],
		  effects: [
			  { stack: "resource", res: "corruption", type: "max", amount: 50, source: "swamp", button: "pustule" }
		  ],
		  filled: 0,
		  unfilled: [],
/*		  onPurchase: function() {
			  this.unfilled.push({ level: 0 });
			  this.count += 1;
			  this.updateButtonLabel();
			  this.updateRatio();
			  updateContentCosts(1);
		  }, */
		  fillPus: function(x) {
//			  msg("fillPus called with value " + x);
			  let sus = x;    //sustenance available
			  let spent = 0;
			  let count = this.unfilled.length; //get total number of unfilled pustules
			  if (count > 0) {
				  for (let i = 0; i < count; i++) {
					  if (sus < 1) { 
						  break;
					  }
					  this.unfilled[i].level += 1;
					  sus -= 1;
					  spent += 1;
					  if (this.unfilled[i].level >= 30) {
						  this.filled += 1;
						  this.unfilled.shift();
						  this.updateButtonLabel();
					  }
				  }
			  }

			  let newCount = this.unfilled.length;
			  let progWidth = 0;
			  if (newCount > 0) {
				  progWidth = (this.unfilled[0].level / 30) * 100;
			  } 

			  document.getElementById(this.name + "Progress").style.width = progWidth + "%";
			  
			  return spent;
		  },
		  popPustule: function(count) {
			  if (!this.filled > 0) {
				  return
			  } else {
				  this.filled -= 1;
				  this.unfilled.push({ level: 0 });
				  resources.gatherByName("choler");
				  this.updateButtonLabel();
			  }  
		  },
		  updateButtonLabel: function() {
			  let newLabel = this.label;
				  if (this.count > 0) {
					  newLabel = newLabel + " (" + this.filled + "/" + this.count + ")";
				  }
			  document.getElementById(this.name + "Label").innerText = newLabel;
		  }
		},
		{ name: "digestor",		//5
		  label: "Digestor",
		  desc: "This organ automatically processes captured prey into Sustenance.",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 20, ratio: 1.2 },
			  { name: "choler", amount: 50, ratio: 1.2 }
		  ],
		  actions: []
		},
		{ name: "trap",			//6
		  label: "Trap",
		  desc: "Sticky traps make it easier to catch prey, and have a small chance to capture prey automatically.",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 50, ratio: 1.2 },
			  { name: "choler", amount: 20, ratio: 1.2 }
		  ],
		  actions: []
		},
		{ name: "siren",		//7
		  label: "Siren",
		  desc: "Lure in advanced lifeforms.",
		  count: 0,
		  costs: [],
		  ratio: 1.2,
		  actions: []
		},
		{ name: "nodule",		//8
		  label: "Nodule",
		  desc: "Store additional corruption.",
		  count: 0,
		  costs: [],
		  ratio: 1.2,
		  actions: [],
		  isUnlocked: false
		},
		{ name: "corruptHost",	//9
		  label: "Corrupt a host",
		  type: "gather",
		  desc: `Convert a captured native into your first corrupted Host.
(Starts phase 2)`,
		  actions: []
		}
		],
	findEntry: function(name) {
		let findName = name;
		for (let i = 0; i < swamp.stack.length; i++) {
			if (swamp.stack[i].name == findName) {
				return i;
			}
		}
	},
	buyEntry: function(num) { }
}


// ---- end phase 1 buildings ---- //

const resources = {};
const resourcesBase = {
	name: "resources object",
	stack: [
		{ name: "corruption", // 0
		  label: "Corruption",
		  current: 0,
		  limited: true,
		  isUnlocked: true,
		  max: 50,
		  overflow: 0,
		  perTick: 0,
		  gatherRate: 1,
		  updateMax: function() {					//FLAG need to build into EFFECTS object arrays
			  let swl = findBldgInSwamp("swell");
			  let pus = findBldgInSwamp("pustule");
			  let newMax = 50 + (swamp.stack[swl].count * 5) + (swamp.stack[pus].count * 50);
			  this.max = newMax;
		  }
		},
		{ name: "prey", // 1
		  label: "Prey",
		  current: 0,
		  limited: true,
		  isUnlocked: true,
		  max: 25,
		  perTick: 0,
		  gatherChance: 0.25,
		  gather: function() {
			  let totalRes = this.current;
			  let chance = this.gatherChance;
			  if (chance >= Math.random()) {
				  totalRes += 1;
				  msg("you have captured prey!");
			  }
			  else {
				  msg("you have failed to capture any prey");
			  }
			  if (totalRes >= this.max) {
				  this.current = this.max;
			  } else {
				  this.current = round3(totalRes);
		  }
			  }
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
			  { name: "prey", amount: 2 }
			  ],
		  gather: function() {
			  let totalRes = this.current;

			  //update target resource
			  totalRes += this.gatherRate;
			  if (totalRes >= this.max) {
				  this.current = this.max;
			  } else {
				  this.current = round3(totalRes);
			  }
			  resources.loadResourcePanel(); // need to clean up this code
		  },
		  updateGatherRate: function() {
			  msg("sustenance rate is " + this.gatherRate + " per click. Not yet defined.");
		  },
		  updatePerTick: function() {
			  this.perTick = 1; // need to define logic.
			  msg("Amount per tick is now " + this.perTick + " per click.");
		  }
		},
		{ name: "choler", //3
		  label: "Choler",
		  current: 0,
		  limited: true,
		  isUnlocked: false,
		  max: 150,
		  perTick: 0,
		  gatherRate: 30,
		  gather: function() {
			  let totalRes = this.current;
			  totalRes += this.gatherRate;

			  if (totalRes >= this.max) {
				  this.current = this.max;
			  } else {
				  this.current = round3(totalRes);
			  }
		  }
		},
		{ name: "native", //4
		  // need to build in way to change based upon phase -- native > subject > citizen > ??
		  // try making label a function, add a switch based upon phase
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
		  isUnlocked: false,
		  gatherRate: 1,
		  gatherCost: [
			  { name: "corruption", amount: 2000 },
			  { name: "native", amount: 1 }
			  ]
		}
	],
	addRes: function(resCode, amount) {
		devMsg("resources.addRes called with resCode " + resCode + " and amount " + amount);
		let res = this.stack[resCode];
		let totalRes = res.current;
		let max = res.max;

		totalRes += amount;

		if (totalRes >= max) {
			res.current = res.max;
		} else {
			res.current = round3(totalRes);
		}
		this.loadResource(resCode);
		devMsg("addRes completed");
	},
	canAddAnyRes: function(res) {
		let checkType = typeof res;
		let resCode = (checkType == "number") ? res : resources.findResInStack(res);		
		let targetRes = resources.stack[resCode];
		let result = (targetRes.current < targetRes.max) ? true : false;
		return result;
	},
	checkCosts: function(x) {					// FLAG for possible deletion
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
	checkCostsByArray: function(array, multi) {		//send resources.checkCostsByArray an array of costs to check
		let result = { result: "fail", reason: "failed function" };
		if (array === undefined) {
			result = { result: "pass", reason: "no costs" };
			return result;
		}
		let prices = array;
		for (let i = 0; i < prices.length; i++) {
			let priceName = prices[i].name;
			let priceCode = resources.findResInStack(priceName);
			let value = (prices[i].ratio > 0) ? round3(prices[i].amount * Math.pow(prices[i].ratio, multi)) : prices[i].amount;
			if (value > resources.stack[priceCode].current) {
				result.reason = "insufficient " + priceName;
				return result;
			}
		}
		result.result = "pass";
		result.reason = "sufficient resources";
		devMsg(result.result + " " + result.reason);
		return result;
	},
	payCostsByArray: function(array, multi) {
		for (let i = 0; i < array.length; i++) {
			let priceName = array[i].name;
			let priceCode = resources.findResInStack(priceName);
			let value = (array[i].ratio > 0) ? round3(array[i].amount * Math.pow(array[i].ratio, multi)) : array[i].amount;
			resources.stack[priceCode].current -= value;
			resources.loadResource(priceCode);
		}
		msg("payCostsByArray completed");
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
	loadResource: function(resource) {
		let resName = this.stack[resource].name;
		let resCurrent = round3(this.stack[resource].current);

		document.getElementById(resName + 'Current').innerText = resCurrent;
	
		if (this.stack[resource].limited) {
			let resMax = "/" + this.stack[resource].max;
		
			document.getElementById(resName + 'Max').innerText = resMax;
		}
	},
	loadResourcePanel: function() {
		for (let i = 0; i < this.stack.length; i++) {
			let resName = this.stack[i].name;
			let resCurrent = round3(this.stack[i].current);

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
	},
	updatePerTick: function() {
		// a bunch of stuff is needed here to calculate pertick values for all resources
		// likely a for loop
		// the code below is specifically for pustules and sustenance only
		let perTickValue = 0;
		let availableSus = this.stack[2].current + perTickValue;
		let subtract = swamp.stack[1].fillPus(availableSus);
		this.stack[2].current = this.stack[2].current + perTickValue - subtract;
	}
} // --- close resources object --- //

// --- start research object --- //

const research = {};
const researchBase = {};
	
/*





*/

// --- close science object --- //


function findBldgInSwamp(name) {
	let findName = name;
	for (let i = 0; i < swamp.stack.length; i++) {
		if (swamp.stack[i].name == findName) {
			return i;
		}
	}
}

// -- start loading items here -- //

function loadGame() {	//runs at end of HTML load
// Object.assign(TO,FROM);
	Object.assign(swamp, swampBase);
	Object.assign(resources, resourcesBase);
	Object.assign(game, gameBase);
	game.buildNav();
	timing.activateBelt();
	resources.loadResourcePanel();
	setDevButtonsDynamic();
	buildGrid(swamp, swamp.stack);
	msg("You have awakened...");	
}

// -- end loading items -- //

function round3(number) {
	let numNum = Math.round(number * 1000);
	numNum = numNum / 1000;
	return numNum;
}

function getContentCosts(stack, num) {
	devMsg("getContentCosts called");
	
	let prices = stack.stack[num].costs;
	let dispCost = "";
	let count = stack.stack[num].count;
	for (let i = 0; i < prices.length; i++) {
		let priceName = prices[i].name;
		let priceCode = resources.findResInStack(priceName);
		let label = resources.stack[priceCode].label;
		devMsg("calling value");
		let value = (prices[i].ratio > 0) ? round3(prices[i].amount * Math.pow(prices[i].ratio, count)) : prices[i].amount;
		devMsg("value called");
		dispCost += `<div class="bldgCostPriceName">${label}:</div><div class="bldgCostRes">${value}</div>`;
	}
	return dispCost;	
}

function updateContentCosts2(stack, num) {
	devMsg("updateContentCosts2 called with values: " + stack.name + " and " + num);
	let costs = getContentCosts(stack, num);
	document.getElementById(stack.name + num + "Costs").innerHTML = costs;	
}

function updateLabel(stack, num) {
	devMsg("updateLabel called with values: " + stack.name + " and " + num);
	let newLabel = stack.stack[num].label;
	if (stack.stack[num].count > 0) {
		devMsg("stack count is " + stack.stack[num].count + " and inactive count is " + stack.stack[num].inactive);
		let act = (stack.stack[num].inactive > 0) ? stack.stack[num].count - stack.stack[num].inactive + "/" : "";
		newLabel += " (" + act + stack.stack[num].count + ")";
		document.getElementById(stack.name + num + "Label").innerHTML = newLabel;
	}

	if (stack.stack[i].costs) {
		let AC = "";
		devMsg("updateLabel now checking costs for button highlighting");
		if (resources.checkCostsByArray(stack.stack[i].costs, stack.stack[i].count).result == "pass") {
			AC = "active";
		}
		let target = document.getElementById(stack.name + num + "Collapsible");
		if (target.classList.contains("active") && AC != "active") {
			target.classList.remove("active");
		}
		else if (!target.classList.contains("active") && AC = "active") {
			target.classList.add("active");
		}
	}	
}

function updateContentCosts(num) {
	//msg("updateContentCosts called");
	let prices = swamp.stack[num].costs;
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

// -- timing belt to control triggering of periodic code --//

const timing = {
	logTime: 0,
	beltSpeed: 250,
	beltStep: 0,
	activateBelt: function() {
		//call upon initialization
		//msg("logTime is " + this.logTime + "; beltSpeed is " + this.beltSpeed + "; beltStep is " + this.beltStep);
		//msg("activateBelt called");
		this.logTime = Date.now(); 
		//msg(this.logTime);
		//msg("logTime is " + this.logTime + ", and is ... " + typeof this.logTime);
		this.beltTimer = setInterval(this.belt.bind(this), timing.beltSpeed);
	},
	belt: function() {
		//msg("belt function called");
		//check for elapsed time, call function if > 5 minutes
		let nowTime = Date.now();
//		msg("nowTime is now " + nowTime + " and logTime is " + this.logTime);
		let elapsedTime = nowTime - this.logTime;
//		msg("the time is now " + nowTime + ". Elapsed time since last check is " + elapsedTime);
		if (elapsedTime >= 300000) {
			//placeholder
			msg("call idle resource recovery function, elapsed time is approximately " + elapsedTime/60000 + " minutes");
		}
		
		//update belt step and reset belt value if necessary
		
		this.beltStep += 1;
		if (this.beltStep > 40) {
			this.beltStep = 1;
		}

		//call functions based upon belt value - SWITCH FUNCTION

		switch(this.beltStep) {
			case 0:
				break;
			case 1:
				devMsg("beltstep 1");
				break;
			case 2:
			//	msg("beltstep 2");
				break;
			case 3:
			//	msg("beltstep 3");
				break;
			case 4:
			//	msg("beltstep 4");
				break;
			case 5:
			//	msg("beltstep 5");
				break;
			case 6:
			//	msg("beltstep 6");
				break;
			case 7:
				break;
			case 8:
				calendar.updateCal();
				break;
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
				break;
			case 16:
				calendar.updateCal();
				break;
			case 17:
			case 18:
			case 19:
				break;
			case 20:
				this.callBuild();
				break;
			case 21:
			case 22:
			case 23:
				break;
			case 24:
				calendar.updateCal();
				break;
			case 25:
			case 26:
			case 27:
			case 28:
			case 29:
			case 30:
			case 31:
				break;
			case 32:
				calendar.updateCal();
				break;
			case 33:
			case 34:
			case 35:
			case 36:
			case 37:
			case 38:
			case 39:
				break;
			case 40:
				// msg("beltStep collected" + this.beltStep);
				calendar.updateCal();
				break;
		}
		
		//update logTime
		this.logTime = nowTime;
	},
	callBuild: function() {
		devMsg("refreshing active panel via callBuild, auto-called from timing belt");
		switch(game.activeTab) {
			case 0:
				buildGrid(swamp, swamp.stack, true);
				break;
			case 1:
			case 2:
			case 3:
			case 4:
				break;
		}
	}
}


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
		devMsg("updateCal called");
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
/*	adjustRunSpeed: function() {			//FLAG for deletion, but add to timing belt first
		if (this.runSpeed == 2000) {
			this.runSpeed = 500;
		} else {
			this.runSpeed = 2000;
		}
		clearInterval(gameTimer);
		gameTimer = setInterval(tick, this.runSpeed);

	} */
}; 

//-- end calendar object --//

//-- start dev object --//

const dev = [
	{ name: "button0",
	  label: "activate calendar",
	  run: function() {  
		  calendar.activateCal();
	  }
	},
	{ name: "button1",
	  label: "force calendar days",
	  run: function() {
		let devForceDay = calendar.daysPerSeason - 5;
		msg("updateCalDev triggered, days set to " + devForceDay);
		calendar.day = devForceDay;
		calendar.calDisplay();
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
	  }
	},
	{ name: "button4",
	  label: "add prey",
	  run: function() {
		  resources.stack[1].current += 5;
		  resources.loadResource(1);
		  msg("added 5 prey");
	  }
	},
	{ name: "button8",
	  label: "display pustule object",
	  run: function() { objectParseMsg(swamp[4]); }
	},
	{ name: "button9",
	  label: "build grid with open tabs",
	  run: function() { buildGrid(swamp, swamp.stack, true); }
	},
	{ name: "button10",
	  label: "dev mode on/off",
	  run: function() {
		  if (devMode == false) {
			  devMode = true;
			  msg("dev mode activated");
		  } else {
			  devMode = false;
			  msg("dev mode deactivated");
		  }
	  }
	},
	{ name: "button11",
	  label: "canAddAnyRes - name",
	  run: function() {
		  let result = resources.canAddAnyRes("prey");
		  devMsg("called canAddAnyRes with resource prey by name, result: " + result);
	  }
	  
	},
	{ name: "button12",
	  label: "canAddAnyRes - number",
	  run: function() {
		  let result = resources.canAddAnyRes(1);
		  devMsg("called canAddAnyRes with resource prey by number, result: " + result);
	  }
	},
	{ name: "button13",
	  label: "add phase",
	  run: function() {
		  game.currentPhase += 1;
		  msg("current phase is now " + game.currentPhase);
	  } 
	},
	{ name: "button14",
	  label: "refresh nav",
	  run: function() {
		  game.buildNav();
	  }
	}
/*	{ name: "buttonX",
	  label: "blank",
	  run: function() { }
	  
	} */
];

function setDevButtonsDynamic() {
	let buttonBlock = "";
	for (let i = 0; i < dev.length; i++) {
		let label = dev[i].label;
		let newButton = `<div class="button" onClick="dev[${i}].run()" id="devbutton${i}">${label}</div>`;
		buttonBlock += newButton;
	}
	document.getElementById("devButtons").innerHTML = buttonBlock;
}


//-- start interval timer --//
//-- this should probably be an object --//

let gameTimer = setInterval(tick, calendar.runSpeed);		// FLAG for deletion after full integration with belt

function tick() {
//	msg("tick");
//	resources.updatePerTick();
	resources.loadResourcePanel();
//	calendar.updateCal();
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


function expandButton2(target) {
	devMsg("expandButton2 called with target: " + target);
	const targetContent = document.getElementById(target + "Content");
	const targetButton = document.getElementById(target + "Collapsible");
	
	if (targetContent.style.display == "block") {
		targetContent.style.display = "none"; /* hide content DIV */
		targetButton.style.borderBottom = "1px solid #33aa33"; /* restore border */	
		targetContent.style.maxHeight = "0";

	} else {
		targetContent.style.display = "block";
		targetContent.style.maxHeight = targetContent.scrollHeight + "px";
		targetButton.style.borderBottom = "none";
	}
}

function expandForce(target) {
	devMsg("expandForce called with target: " + target);
	const targetContent = document.getElementById(target + "Content");
	const targetButton = document.getElementById(target + "Collapsible");

//	targetContent.style.transitionDuration = "0s";
	targetContent.style.display = "block";
	targetContent.style.maxHeight = targetContent.scrollHeight + "px";
	targetButton.style.borderBottom = "none";
//	targetContent.style.transitionDuration = "0.2s";
}

function devMsg(text) {
	if (devMode == true) {
		msg(text);
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
