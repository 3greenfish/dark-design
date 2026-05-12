// import { researchBase } from "./tech.js";

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

		if (array[i].isUnlocked !== true) {
			devMsg("calling testUnlock with array object for " + array[i].name);
			//check whether can unlock
			let checkValue = testUnlock(array[i]);
			if (checkValue == true) {
				array[i].isUnlocked = true;
			}
		}
		
		if (array[i].purchased == true || array[i].isUnlocked !== true) { 
			continue; 
		}
		// IF test to check if hidden or blocked, then continue FOR loop.
		
		let label = array[i].label;		//this is what shows in the label, will need to be updated for counts
		if (array[i].count > 0) {
//			let act = (array[i].inactive > 0) ? array[i].count - array[i].inactive + "/" : "";
			let act = ("active" in array[i]) ? array[i].active + "/" : "";
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
		let flavor = (array[i].flavor) ? `<div class="flavor">` + array[i].flavor + "</div>" : "";

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
						${flavor}
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
	refreshProgAll(source, sourceArray);
	if (refresh == true) {
		reopenTabs(source, openArray);
	}
}	

function testUnlock(button) {
	if (button.isUnlocked == true) {
		msg("WARNING, BUTTON ALREADY UNLOCKED, SOMETHING IS SERIOUSLY WRONG");
		return true;
	}
//	msg("testUnlock opened");
	let locks = button.lockedBy;
	let pass = true;

	if (locks === undefined) {
//		msg("warning, no locks for " + button.name);
		return true;
	} 
//	else { devMsg("length of locks for " + button.name + " is " + locks.length); }
	
	for (let i = 0; i < locks.length; i++) {
//		msg("calling locks for " + button.name);
		if (locks[i].opened === true) { 
			continue; 
		}
		if (locks[i].type == "res") {
			let throwArray = [];
			throwArray[0] = locks[i];
//			msg(throwArray.toString());
			let bob = Object.values(throwArray[0]);
			let bobtext = bob.toString();
//			msg("bobtext is " + bobtext + " and length is now " + throwArray.length);
			if (resources.checkCostsByArray(throwArray, 0).result == "pass") {
//				msg("check costs for " + button.name + " lock " + i + "has passed successfully");
				locks[i].opened = true;
				let newbob = Object.values(locks[i]);
				let newbobtext = newbob.toString();
//				msg("new bobtext is " + newbobtext);
			} else { 
//				msg("check costs for " + button.name + " lock " + i + "has failed");
				pass = false;
			}
		}
		if (locks[i].type == "tech") { 
			msg("type is tech");
			let stack = research.stack;
			let location = findEntry(stack, locks[i].name);
			if (location.found == true) {
				if (stack[location.loc].purchased === true) {
					locks[i].opened = true;
				} else {
					pass = false;
				}
			} else {
				msg("could not find " + locks[i].name);
				pass = false;
			}
		}
		if (locks[i].type == "button") { 
			devMsg("type is button");
			let stack = "";
			switch (locks[i].stack) {
				case "swamp":
					stack = swamp.stack;
					break;
/*				case "research":
					stack = research.stack;
					break; */
					//FLAG -- separate code for checking research
			}

			let location = findEntry(stack, locks[i].name);
			if (location.found == true) {
				if (stack[location.loc].count >= locks[i].amount) {
					locks[i].opened = true;
				} else {
					pass = false;
				}
			} else {
				pass = false;
			}
		}
	}
/*				SHOULD NOT BE NECESSARY GIVEN THAT IT MATCHES VALUE OF PASS
	if (pass == true) {
		return true;
	} else { 
		return false; 
	} */
	return pass;
}

/*
	type: resource, button, tech
	resource: could be any entry in resource stack
	button: could be any button in building stack
	amount: just a quantity if relevant
	unlocked: triggered for multi-unlock items

	{ type: "res", name: "prey", amount: 1 }

*/

function logOpenTabs(source, sourceArray) {
	let array = [];
	for (let i = 0; i < sourceArray.length; i++) {
		if (document.getElementById(source.name + i + "Content") == null) {
			array.push(false);
		} else {
			let iteration = (document.getElementById(source.name + i + "Content").style.display == "block") ? true : false;
			array.push(iteration);
		}
	}
	return array;
}

function reopenTabs(source, array) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === true) { 
			expandForce(source.name + i); 
		}
	}
}

function refreshProg(source, code) {
	if (document.getElementById(source.name + code + "Collapsible") == null) {
		return;
	}
	let progWidth = source.stack[code].prog;
	document.getElementById(source.name + code + "Progress").style.width = progWidth + "%";
}

function refreshProgAll(source, array) {
	for (let i = 0; i < array.length; i ++) {
		if (array[i].hidden == true || array[i].hasProg !== true || array[i].blocked == true ) { 
			continue;
		}
		if (document.getElementById(source.name + i + "Collapsible") == null) {
			continue;
		}
		let progWidth = array[i].prog;
		document.getElementById(source.name + i + "Progress").style.width = progWidth + "%";
	}
}

// --- basic game information saved in object --- //

let game = {};
class GameBase {
	currentPhase;
	phases;
	activeTab;
	tabs;
	constructor() {	
		this.currentPhase = 0;
		this.phases = [
			{ name: "swamp" },
			{ name: "tribe" },
			{ name: "city" },
			{ name: "nation" },
			{ name: "world" },
			{ name: "space" }
			];
		this.activeTab = 0;
		this.tabs = [
			{ name: "swamp", 		//0
			  label: "a sinister swamp",
			  visible: true,
			  lockAtPhase: 1,
			  select: function() {
	/*			  game.activeTab = num;
				  game.refreshNav();
				  devMsg(this.name + " selected"); */
				  buildGrid(swamp, swamp.stack);
			  }
			},
			{ name: "personnel",	//1
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
						  break;
					  default:
						  label2 = "error";
				  }
				  return label2;
			  },
	//		  label: "tribe",
			  unlockAtPhase: 1,
			  select: function(num) {
	/*			  game.activeTab = num;
				  game.refreshNav();
				  devMsg(this.name + " selected"); */
			  }
			},
			{ name: "home",			//2
			  label: "settlement",
			  unlockAtPhase: 2,
			  select: function(num) {
	/*			  game.activeTab = num;
				  game.refreshNav();
				  devMsg(this.name + " selected"); */
			  }
			},
			{ name: "world",		//3
			  label: "world", // update to start as "nearby towns"?
			  unlockAtPhase: 3,
			  select: function(num) {
	/*			  game.activeTab = num;
				  game.refreshNav();
				  devMsg(this.name + " selected"); */
			  }
			},
			{ name: "research",		//4
			  label: "research",
			  select: function(num) {
				  buildGrid(research, research.stack);
	/*			  game.activeTab = num;
				  game.refreshNav();
				  devMsg(this.name + " selected"); */
			  }
			}
		];
	}
	buildNav() {
		let navList = "";
		for (let i = 0; i < this.tabs.length; i++) {
			let tabLabel = this.tabs[i].label;
			let activeFlag = "";
	//		let action = `game.tabs[${i}].select(${i})`;
			let action = `game.selectNav(${i})`;
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
	}
	refreshNav() {
		for (let i = 0; i < this.tabs.length; i++) {
			let element = document.getElementById("tab" + i);
			if (element.classList.contains("activeTab")) {
				element.classList.remove("activeTab");
			}
		}
		document.getElementById("tab" + this.activeTab).classList.add("activeTab");
	}
	selectNav(x) {
		game.activeTab = x;
		game.refreshNav();
		game.tabs[x].select();
		devMsg(game.tabs[x].name + " selected");
	}
}

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
		 
BASIC DESIGN FOR MAIN PRESS, using buyCycle
					press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;
							// **special actions here**

							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio
							refreshProgAll(swamp, swamp.stack); //if has progress
						}
		 */

let swamp = {};
class SwampBase {
	name = "swamp";
	stack;
	constructor() {
		this.stack = [
			{ name: "fester",	//0
			  label: "Fester",
			  type: "gather",		//FLAG for POSSIBLE DELETION -- do we need types on these buttons right now?
			  desc: "Fester in darkness to build up Corruption.",
			  flavor: "", 
			  isUnlocked: true,
			  actions: [
				  { subLabel: "Fester",
				    type: "main", 
				    press: function(code, isMain = false) {
						let r = resources.findResInStack("corruption");
						let a = effectsManager.cache.corruptionPerClick;
						resources.addRes(r, a);
	
						devMsg("code is " + code + ", isMain is " + isMain);
					}
				  }
			  ]
			},
			{ name: "ensnare",	//1
			  label: "Ensnare prey",
			  type: "gather",
			  desc: "Attempt to catch unsuspecting creatures to use as fuel. Burn corruption to improve your odds.",
			  flavor: "",
			  costs: [
				  { name: "corruption", amount: 1 }
			  ],
	//		  isUnlocked: true,
			  actions: [
				  { subLabel: "Ensnare",
				    type: "main",
				    press: function(code, isMain = false) {
						let r = resources.findResInStack("prey");
	//					let res = resources.stack[r];
						let ch = effectsManager.cache.preyPerClickChance;
						// FLAG for ADDITION -- if chance exceeds 100%, log overage as bonus to amount caught
						if (resources.canAddAnyRes(r) == true ) {
							if (ch >= Math.random()) {
								let maxPrey = effectsManager.cache.preyPerClickChanceMax;
								let amountCaught = randomInt(1, maxPrey);		//FLAG FOR UPDATING BY CALCULATION
								resources.addRes(r, amountCaught);
								msg("Captured " + amountCaught + " prey!");
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
				  },
				  { subLabel: "Burn corruption to ensnare",
			   		type: "",
					press: function(code, isMain = false) {
						let getCosts = swamp.stack[code].costs;
						let r = resources.findResInStack("prey");
						if (resources.checkCostsByArray(getCosts,0).result == "pass" && resources.canAddAnyRes(r) == true ) {
							resources.payCostsByArray(getCosts,0);
							let ch = effectsManager.cache.preyPerClickChance * 2;
							// FLAG for ADDITION -- if chance exceeds 100%, log overage as bonus to amount caught
							if (ch >= Math.random()) {
								let maxPrey = effectsManager.cache.preyPerClickChanceMax * 2;
								let amountCaught = randomInt(1, maxPrey);
								resources.addRes(r, amountCaught);
								msg("Captured " + amountCaught + " prey!");
							} else {
								msg("You have failed to capture any prey.");
							}
						}
					}
				  }
			  ],
			  lockedBy: [
				  { type: "res", name: "corruption", amount: 1 }
			  ]
			},
			{ name: "digest",	//2
			  label: "Digest prey",
			  type: "gather",
			  desc: "Process captured prey to generate Sustenance.",
			  costs: [
				  { name: "prey", amount: 2 }
			  ],
			  lockedBy: [
				  { type: "res", name: "prey", amount: 1 }
			  ],
			  actions: [
				  { subLabel: "Digest prey",
				    type: "main",
				    press: function(code, isMain = false) {
						devMsg("Digest button called");
						let getCosts = swamp.stack[code].costs;
						devMsg("loaded getCosts");					
						if (resources.checkCostsByArray(getCosts, 0).result == "pass" && resources.canAddAnyRes("sustenance")) {
							devMsg("checked costs, checked to add res");
							resources.payCostsByArray(getCosts, 0);
							let r = resources.findResInStack("sustenance");
							let a = effectsManager.cache.sustenancePerClick;
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
			  stackable: true,
			  costs: [
				  { name: "corruption", amount: 10, ratio: 1.3 }
			  ],
			  actions: [
				  { subLabel: "Swell by 1m^2",
				    type: "main",
				    press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;
							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
						}
	
/*						let swell = swamp.stack[code];		//FLAG FOR DELETION
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
						}		*/			
					}
				  }
			  ],
			  effects: [
				  { effect: "corruptionPerClick", value: 0.1 },
				  { effect: "corruptionMax", value: 5 }
			  ],
			  unlocks: [],
			  lockedBy: [
				  { type: "res", name: "corruption", amount: 10 }
			  ]
			},
			{ name: "pustule",     //4
			  label: "Pustule",
			  desc: `Pustules process Sustenance into a thick bile.</p><p>
	Once full, pustules generate Corruption, and can be popped for Choler.`,
			  hasProg: true,
			  get prog() {
				  let result = 0;
				  if ( this.special.unfilled.length > 0 ) {
		//			  msg ("length of pustule array is " + this.unfilled.length);
					  msg("unfilled status is " + this.special.unfilled.toString());
					  result = (this.special.unfilled[0] / 30) * 100;
		//			  msg("current pustule level is " + result);
				  }
				  return result;
			  },
			  count: 0,
/*			  get count() {				//FLAG for deletion
	//			  console.log("getting pustule count");
				  return this.special.filled + this.special.unfilled.length;
			  }, */ 
			  stackable: true,
			  active: 0,
			  get inactive() {
				  return this.special.unfilled.length;
			  },
			  costs: [
				  { name: "corruption", amount: 40, ratio: 1.2 }
			  ],
	//		  ratio: 1.2,
			  actions: [
				  { subLabel: "Grow pustule",
				    type: "main",
				    press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;
							swamp.stack[code].special.unfilled.push(0);

							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
							refreshProgAll(swamp, swamp.stack);
						}

	/*					devMsg("buy pustule called");
						let grow = swamp.stack[code];
						let getCosts = grow.costs;
						let current = grow.count;
						devMsg("pustule getCosts called");
	
						if (resources.checkCostsByArray(getCosts, current).result == "pass") {
							resources.payCostsByArray(getCosts, current);
	
							swamp.stack[code].special.unfilled.push(0);
							swamp.stack[code].count += 1;
	
							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
							refreshProgAll(swamp, swamp.stack);
						}
						else if (isMain == true) {
							//expand or close button
							devMsg("isMain is TRUE, calling expandButton2");
							let target = "swamp" + code;
							expandButton2(target);
						} */
					}
				  },
				  { subLabel: "Fill Pustules",
				    type: "",
				    press: function(code) {
/*						let spent = */ 
						swamp.stack[code].fillPus(code);
/*						let spentArray = [{ name: "sustenance", value: spent };
						resources.payCostsByArray(spentArray); */
						refreshProgAll(swamp, swamp.stack);
						updateLabel(swamp, code);
					}
				  },
				  { subLabel: "Pop",
				    type: "",
				    press: function(code) {
						swamp.stack[code].popPustule(1);
						updateLabel(swamp, code);
					}
				  },
				  { subLabel: "Pop all",
				    type: "",
				    press: function(code) {
			//			let count = swamp.stack[code].filled;
	
						// call pop pustule code? check for amount fillable?
					}
				  }
			  ],
			  effects: [
				  { effect: "corruptionMax", value: 50 },
				  { effect: "corruptionPerTick", value: 0.25, type: "active" },
				  { effect: "sustenancePerTickReserve", value: 0.25, type: "inactive" },
				  { effect: "pustulePerTick", value: 0.25, sourceName: "sustenance", sourceAmount: 0.25, con: "call", type: "inactive", call: function() {
//					  msg("numUnits is " + this.numUnits + " and value is " + this.value);
					  if (this.numUnits > 0 ) {
						  let code = findEntry(swamp.stack, "pustule").loc;
						  swamp.stack[code].fillPus(this.value);
						  refreshProg(swamp, code);
					  }
					}
				  }
			  ],
			  lockedBy: [
				  { type: "res", name: "corruption", amount: 30 },
				  { type: "res", name: "sustenance", amount: 10 },
				  { type: "button", stack: "swamp", name: "swell", amount: 1 }
			  ],
			  special: {
				  unfilled: []
			  },
	/*		  onPurchase: function() {
				  this.unfilled.push({ level: 0 });
				  this.count += 1;
				  this.updateButtonLabel();
				  this.updateRatio();
				  updateContentCosts(1);
			  }, */
			  fillPus: function(unit) {
				  let x = resources.findResInStack("sustenance");
				  let sus = resources.stack[x].reserve;    //sustenance available

				  let spent = 0;
				  let array = this.special.unfilled;
//				  devMsg("current is " + sus + ", spent is " + spent + ", count is " + array.length + ", array is " + array.toString());
				  if (array.length > 0) {
					  for (let i = 0; i < array.length; i++) {
						  if (spent + unit > sus) { 
							  break;
						  }
						  array[i] += unit;
						  spent += unit;
					  }
					  for (let j = 0; j < array.length; j++) {
						  if (array[j] >= 30) {
							  this.active += 1;
							  array.shift();
						  }
					  }
//					  msg("current is " + sus + ", spent is " + spent + ", count is " + array.length);
//					  msg("reserves before payment: " + resources.stack[x].reserve);
					  resources.stack[x].reserve -= spent;
//					  msg("reserves after payment: " + resources.stack[x].reserve);
				  }
	
				/*  let newCount = array.length;
				  let progWidth = 0;
				  if (newCount > 0) {
					  progWidth = (array[0] / 30) * 100;
				  } 
	
				  document.getElementById("swamp" + code + "Progress").style.width = progWidth + "%";
				  */
				  return spent;
			  },
			  popPustule: function(count) {
				  if (this.active < 1) {
					  return;
				  } else {
					  this.active -= 1;
					  this.special.unfilled.push(0);
					  let res = resources.findResInStack("choler");
					  let amt = effectsManager.cache.cholerPerClick;
					  resources.addRes(res, amt);
//					  resources.gatherByName("choler");
//					  this.updateButtonLabel();
				  }  
			  },
	/*		  updateButtonLabel: function() {				//READY TO DELETE
				  let newLabel = this.label;
					  if (this.count > 0) {
						  newLabel = newLabel + " (" + this.filled + "/" + this.count + ")";
					  }
				  document.getElementById(this.name + "Label").innerText = newLabel;
			  } */
			},
			{ name: "trap",			//5
			  label: "Trap",
			  desc: "Sticky traps make it easier to catch prey, and have a small chance to capture prey automatically.",
			  count: 0,
			  stackable: true,
			  costs: [
				  { name: "corruption", amount: 50, ratio: 1.2 },
				  { name: "choler", amount: 20, ratio: 1.2 }
			  ],
			  actions: [
				  { subLabel: "Build a trap",
				    type: "",
				    press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;
	
							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio
						}
						
/*						devMsg("buy trap called");
	
						let grow = swamp.stack[code];
						let getCosts = grow.costs;
						let current = grow.count;

						if (resources.checkCostsByArray(getCosts, current).result == "pass") {
							resources.payCostsByArray(getCosts, current);
	
							swamp.stack[code].count += 1;
	
							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
						}
						else if (isMain == true) {
							//expand or close button
							devMsg("isMain is TRUE, calling expandButton2");
							let target = "swamp" + code;
							expandButton2(target);
						} */
					}
				  }
			  ],
			  lockedBy: [
				  { type: "res", name: "choler", amount: 10 }
			  ],
			  effects: [
				  { effect: "preyMax", value: 5 },
				  { effect: "preyPerClickChance", value: 0.05 },
				  { effect: "preyPerTickChance", value: 0.05 },
				  { effect: "preyPerClickChanceMax", value: 1 }
			  ]
			},
			{ name: "digestor",		//6
			  label: "Digestor",
			  desc: "This organ automatically processes captured prey into Sustenance.",
			  count: 0,
			  stackable: true,
			  costs: [
				  { name: "corruption", amount: 20, ratio: 1.2 },
				  { name: "choler", amount: 40, ratio: 1.2 }
			  ],
			  actions: [
				  { subLabel: "Grow a digestor",
				    type: "",
				    press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;

							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio

						}				  
/*						devMsg("buy digestor called");
						let grow = swamp.stack[code];
						let getCosts = grow.costs;
						let current = grow.count;

						if (resources.checkCostsByArray(getCosts, current).result == "pass") {
							resources.payCostsByArray(getCosts, current);
	
							swamp.stack[code].count += 1;
	
							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
						}
						else if (isMain == true) {
							//expand or close button
							devMsg("isMain is TRUE, calling expandButton2");
							let target = "swamp" + code;
							expandButton2(target);
						} */
				    }
				  }
			  ],
			  lockedBy: [
				  { type: "res", name: "choler", amount: 10 },
				  { type: "button", stack: "swamp", name: "pustule", amount: 2 },
				  { type: "button", stack: "swamp", name: "trap", amount: 1 }
			  ],
			  effects: [
				  { effect: "preyPerTickReserve", value: 0.25 },
				  { effect: "sustenancePerTick", value: 0.5, con: "basic", sourceName: "prey", sourceAmount: 0.25, creates: "sustenance" }
			  ]
			},
			{ name: "siren",		//7
			  label: "Siren",
			  desc: "Improve your ability to capture prey, and lure in advanced lifeforms.",
			  flavor: "It's creepy how that fungus is throbbing, but it has a very sexy singing voice.",
			  count: 0,
			  active: 0,
			  stackable: true,
			  costs: [
				  { name: "corruption", amount: 500, ratio: 1.2 }
			  ],
			  ratio: 1.2,
			  actions: [
				  { subLabel: "Grow a siren",
				    type: "",
				    press: function(code, isMain = false) {
					    let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;

							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio
						}					   
				   }
				  },
				  { subLabel: "Boost with choler",
				    type: "",
				    press: function(code, isMain = false) {
						let bld = swamp.stack[code];
						if (bld.active < bld.count) {
							bld.active += 1;
						}
					}
				  },
				  { subLabel: "Boost with choler",
				    type: "",
				    press: function(code, isMain = false) {
						let bld = swamp.stack[code];
						if (bld.count > 0 && bld.active > 0) {
							bld.active -= 1;
						}
					}
				  }
			  ],
			  lockedBy: [
				  { type: "button", stack: "swamp", name: "trap", amount: 5 }
			  ],
			  effects: [
				  { effect: "nativeMax", value: 1 },
				  { effect: "nativePerTickChance", value: 0.05 },
				  { effect: "preyPerTickChance", value: 0.1 },
				  { effect: "preyMax", value: 10 },
				  { effect: "preyPerClickChanceMax", value: 3 },
				  { effect: "cholerPerTickConsumption", value: 0.05, type: "active" },
				  { effect: "nativePerTickChance", value: 0.05, type: "active" }
			  ]
			},
			{ name: "nodule",		//8
			  label: "Nodule",
			  desc: "Store additional corruption.",
			  count: 0,
			  active: 0,
			  stackable: true,
			  costs: [
				  { name: "corruption", amount: 100, ratio: 1.2 },
				  { name: "sustenance", amount: 10, ratio: 1.2 },
				  { name: "choler", amount: 5, ratio: 1.2 }
				  
				 // { name: "native", amount: 1 }
			  ],
			  ratio: 1.2,
			  actions: [
				  { subLabel: "Grow a nodule",
				    type: "",
					press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							swamp.stack[code].count += 1;
							swamp.stack[code].active += 1;

							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio
						}					   
				   }
				  },
				  { subLabel: "deflate",
				    type: "",
				    press: function(code) {
						let nodules = swamp.stack[code];
						if (nodules.count > 0 && nodules.active > 0) {
							nodules.active -= 1;
						}
					}
				  },
				  { subLabel: "inflate",
				    type: "",
				    press: function(code) {
						let nodules = swamp.stack[code];
						if (nodules.active < nodules.count) {
							nodules.active += 1;
						}
					}
				  }
			  ],
			  isUnlocked: false,
			  lockedBy: [
				  { type: "res", name: "native", amount: 1 }
			  ],
			  effects: [
				  { effect: "sustenancePerTickConsumption", value: 0.5, type: "active" },
				  { effect: "corruptionMax", value: 100, type: "active" }
			  ]
			},
			{ name: "corruptHost",	//9
			  label: "Corrupt a host",
			  type: "gather",
			  desc: `Convert a captured native into your first corrupted Host.
	(Starts phase 2)`,
			  get count() {
				  let referCount = resources.stack[resources.findResInStack("host")].current;
				  return referCount;
			  },
			  costs: [
				  { name: "corruption", amount: 2000, ratio: 1.01 },
				  { name: "native", amount: 1 }		//FLAG -- do we need a ratio on any cost?
				  ],
			  actions: [
				  { subLabel: "",
				   	type: "",
				   	press: function(code, isMain = false) {
						let priceCheck = resources.buyCycle(swamp, code, isMain);
						if (priceCheck.result == "pass") {
							resources.addRes(resources.findResInStack("host"), 1);

							// SPECIAL ACTIONS HERE - START PHASE 2
	
							updateLabel(swamp, code); //if has count
							updateContentCosts2(swamp, code); //if has ratio**
						}
				   }
				  }
			  ],
			  lockedBy: [
				  { type: "res", name: "native", amount: 1 }
			  ]
			}
			];
	}
	findEntry(name) {			//flag for deletion
		let findName = name;
		for (let i = 0; i < swamp.stack.length; i++) {
			if (swamp.stack[i].name == findName) {
				return i;
			}
		}
	}
	buyEntry(num) { } //flag for deletion
}

// ---- end phase 1 buildings ---- //

function findEntry(stack, name) {
	let result = { found: false, loc: 0 };

	for (let i = 0; i < stack.length; i++) {
		if (stack[i].name == name) {
			result.found = true;
			result.loc = i;
			break;
		}
	}
	return result;
}


let resources = {};
class ResourcesBase {
	name = "resources object";
	stack;
	effectsBase = [];
	constructor() {
		this.stack = [
			{ name: "corruption", // 0
			  label: "Corruption",
			  current: 0,
			  overflow: 0,
			  limited: true,
			  isUnlocked: true /*,
			  updateMax: function() {					//FLAG need to build into EFFECTS object arrays
				  let swl = findBldgInSwamp("swell");
				  let pus = findBldgInSwamp("pustule");
				  let newMax = 50 + (swamp.stack[swl].count * 5) + (swamp.stack[pus].count * 50);
				  this.max = newMax;
			  } */
			},
			{ name: "prey", // 1
			  label: "Prey",
			  current: 0,
			  overflow: 0,
			  limited: true,
			  isUnlocked: false 
/*,			  gather: function() {		//FLAG for deletion
				  let totalRes = this.current;
				  let chance = effectsManager.cache[this.name + "PerClickChance"];
				  if (chance >= Math.random()) {
					  totalRes += 1;
					  msg("you have captured prey!");
				  }
				  else {
					  msg("you have failed to capture any prey");
				  }

				  let thisMax = effectsManager.cache[this.name + "Max"];
				  if (totalRes >= thisMax) {
					  this.current = thisMax;
				  } else {
					  this.current = round3(totalRes);
				  }
			  } */
			},
			{ name: "sustenance", //2
			  label: "Sustenance",
			  current: 0,
			  overflow: 0,
			  limited: true,
			  isUnlocked: false /*,
			  gatherCost: [			//FLAG for deletion
				  { name: "prey", amount: 2 }
				  ],
			  gather: function() {	//FLAG for deletion
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
			  updateGatherRate: function() {		//FLAG for deletion
				  msg("sustenance rate is " + this.gatherRate + " per click. Not yet defined.");
			  },
			  updatePerTick: function() {		//FLAG for deletion
				  this.perTick = 1; // need to define logic.
				  msg("Amount per tick is now " + this.perTick + " per click.");
			  } */
			},
			{ name: "choler", //3
			  label: "Choler",
			  current: 0,
			  overflow: 0,
			  limited: true,
			  isUnlocked: false,
			  gather: function() { //FLAG for deletion
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
			  limited: true,
			  isUnlocked: false
			},
			{ name: "host", //5
			 	// hosts are controllable by the player in phase 2
			  label: "Hosts",
			  current: 0,
			  limited: false,
			  isUnlocked: false,
			  gatherCost: [
				  { name: "corruption", amount: 2000 },
				  { name: "native", amount: 1 }
			  ]
			}
		];
		this.effectsBase = [			//FLAG that some of these values may not be necessary
			{ effect: "corruptionMax", value: 50 },
			{ effect: "corruptionPerTick", value: 0 },
			{ effect: "corruptionPerClick", value: 1 },
			{ effect: "preyMax", value: 25 },
			{ effect: "preyPerTick", value: 0 },
			{ effect: "preyPerClickChanceMax", value: 1 },
			{ effect: "preyPerClickChance", value: 0.25 },
//			{ effect: "preyPerTickChance", value: 0.1 },
			{ effect: "sustenanceMax", value: 40 },
			{ effect: "sustenancePerTick", value: 0 },
			{ effect: "sustenancePerClick", value: 1 },
			{ effect: "cholerMax", value: 150 },
			{ effect: "cholerPerTick", value: 0 },
			{ effect: "cholerPerClick", value: 30 },
			{ effect: "nativeMax", value: 10 },
			{ effect: "nativePerClickChanceMax", value: 1 },
//			{ effect: "hostMax", value: "nativeMax" },
			{ effect: "hostMax", value: 10 },
			{ effect: "hostPerClick", value: 1 }
		];

		
//			{ effect: "", value: },
		
	}
	addRes(resCode, amount) {
		devMsg("resources.addRes called with resCode " + resCode + " and amount " + amount);
		let res = this.stack[resCode];
		let totalRes = res.current;
		let max = effectsManager.cache[res.name + "Max"];

		totalRes += amount;

		if (totalRes >= max) {
			res.current = max;
		} else {
			res.current = round3(totalRes);
		}
		this.loadResource(resCode);
		devMsg("addRes completed");
	}
	canAddAnyRes(res) {
		let checkType = typeof res;
		let resCode = (checkType == "number") ? res : resources.findResInStack(res);		
		let targetRes = resources.stack[resCode];
		let targetMax = effectsManager.cache[targetRes.name + "Max"];
		let result = (targetRes.current < targetMax) ? true : false;
		return result;
	}
/*	checkCosts(x) {					// FLAG for possible deletion
		let result = { result: "fail", reason: "failed function" };
//		if (!this.stack[x].gatherCost.length > 0) 
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
	} */
	checkCostsByArray(array, multi) {		//send resources.checkCostsByArray an array of costs to check
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
	}
	payCostsByArray(array, multi) {
		for (let i = 0; i < array.length; i++) {
			let priceName = array[i].name;
			let priceCode = resources.findResInStack(priceName);
			let value = (array[i].ratio > 0) ? round3(array[i].amount * Math.pow(array[i].ratio, multi)) : array[i].amount;
			resources.stack[priceCode].current -= value;
			resources.loadResource(priceCode);
		}
		devMsg("payCostsByArray completed");
	}
	buyCycle(stack, code, isMain) {		//consider adding "checkAdd" value to incorporate canAddAnyRes
		//multi is the current count to pass for ratio checks
		let bld = stack.stack[code];
		let getCosts = bld.costs;
		let current = bld.count || 0;
		
		let check = resources.checkCostsByArray(getCosts, current);
		
		if (check.result == "pass" && check.reason !== "no costs") {
			resources.payCostsByArray(getCosts, current);
		}
		else if (check.result == "fail" && isMain == true) {
			let target = stack.name + code;
			expandButton2(target);
		}
		return check;

		

/*
						let grow = swamp.stack[code];
						let getCosts = grow.costs;
						let current = grow.count;
	
						if (resources.checkCostsByArray(getCosts, current).result == "pass") {
							resources.payCostsByArray(getCosts, current);
	
							swamp.stack[code].special.unfilled.push(0);
							swamp.stack[code].count += 1;
	
							updateLabel(swamp, code);
							updateContentCosts2(swamp, code);
							refreshProgAll(swamp, swamp.stack);
						}
						else if (isMain == true) {
							//expand or close button
							devMsg("isMain is TRUE, calling expandButton2");
							let target = "swamp" + code;
							expandButton2(target);
						} */



		
	}
	findResInStack(name) {
		let findName = name;
		for (let i = 0; i < this.stack.length; i++) {
			if (this.stack[i].name == findName) {
				return i;
			}
		}
	}
	// gatherByName(res) {							//FLAG for DELETION
	//	let code = this.findResInStack(res);
	//	this.gather(code);
	//	}
	loadResource(resource) {
		let resName = this.stack[resource].name;
		let resCurrent = round3(this.stack[resource].current);

		document.getElementById(resName + 'Current').innerText = resCurrent;
	
		if (this.stack[resource].limited) {
			let resMax = "/" + effectsManager.cache[resName + "Max"];
		
			document.getElementById(resName + 'Max').innerText = resMax;
		}
	}
/*	loadResourcePanel() {			//FLAG for deletion
		for (let i = 0; i < this.stack.length; i++) {
			let resName = this.stack[i].name;
			let resCurrent = round3(this.stack[i].current);

			if (this.stack[i].isUnlocked == false) { // temp to test if identification of locked/unlocked is working
				if (resCurrent > 0) {
					this.stack[i].isUnlocked = true;
					let resRow = document.getElementById("res" + i + "row");
					if (resRow) resRow.classList.remove("hidden");   // unlock resource if user has any
				} else { 
					continue; } // otherwise, stop the iteration and move on to the next resource
			}
			
			document.getElementById(resName + 'Current').innerText = resCurrent;
		
			if (this.stack[i].limited == true) {
				let resMax = "/" + effectsManager.cache[resName + "Max"];
			
				document.getElementById(resName + 'Max').innerText = resMax;
			}
		}
	} */
	loadResPanelNew() {
		let output = "";
		let source = resources.stack;
		for (let i = 0; i < source.length; i++) {
			let res = source[i];

			//hidden resources either never appear in panel, or are closed out after no longer being relevant
			if (res.hidden) { continue; }

			if (res.isUnlocked !== true) {
//				msg(typeof res.current);
				if (res.current > 0 && typeof res.current == "number") {
//					msg("unlocking now");
					res.isUnlocked = true;
				} else { 
					console.log("trying to unlock " + res.name + ", type is " + typeof res.current);
					continue; 
				}
			}

			let name = res.name;
			let label = res.label;
			let max = (effectsManager.cache[name + "Max"]) ? "/" + effectsManager.cache[name + "Max"] : "";
			let current = (res.overflow > 0) ? round3(res.current + res.overflow) : round3(res.current);
			let perTick = effectsManager.cache[name + "PerTick"] || 0;			//generation
			let reserve = effectsManager.cache[name + "PerTickReserve"] || 0;	//reserve for converting into other res, consumption
			let cons = effectsManager.cache[name + "PerTickConsumption"] || 0;	//straight consumption (e.g., food)
			let conv = effectsManager.cache[name + "PerTickConversion"] || 0;	//generation by converting other resources
			
			let per = (perTick == 0 && reserve == 0 && cons == 0 && conv == 0 ) ? "": ((perTick - reserve - con + conv) * 4) + "/s";
//		(effectsManager.cache[name + "PerTick"]) ? ((effectsManager.cache[name + "PerTick"] - reserve) * 4) + "/s" : "";

			let newRes = `<div class="resource" id="res${i}row">
				<div class="resourceName" id="res${name}">${label}:</div>
				<div class="resourceValue" id="${name}Current">${current}</div>
				<div class="resourceMax" id="${name}Max">${max}</div>
				<div class="resourcePer" id="${name}Per">${per}</div>
			</div>`;

			output += newRes;
		}
		document.getElementById("leftblock").innerHTML = output;
	}

/* 			<div class="resource" id="res0row">
				<div class="resourceName" id="resCorruption">Corruption:</div>
				<div class="resourceValue" id="corruptionCurrent"></div>
				<div class="resourceMax" id="corruptionMax"></div>
				<div class="resourcePer" id="corruptionPer"></div>
			</div> */

	updatePerTick() {
		let resPool = resources.stack;
		for (let i = 0; i < resPool.length; i++ ) {
			let res = resPool[i];
			//confirm resource is unlocked and not hidden
			if (res.isUnlocked == false || res.hidden == true) {
				continue;
			}
			//get amount generated
			let perTick = (effectsManager.cache[res.name + "PerTick"]) ? effectsManager.cache[res.name + "PerTick"] : 0;
/*			if (!perTick) {
				continue;
			} */

			//check against chances to randomly generate resource
			let luckPerTick = resources.perTickChance(res);
			perTick += luckPerTick;

			//reserve res for consumption and conversion
			let avail = res.current + perTick;
			//TODO: check cache for "perTickReserve" or something similar. Add to reserve under each resource. Once consumption, conversion, and possibly crafting are done, return unused reserves.

			let consumption = effectsManager.cache[res.name + "PerTickConsumption"] || 0;
			let reserveRequest = effectsManager.cache[res.name + "PerTickReserve"] || 0;
			let reserve = consumption + reserveRequest;
			if (reserve > avail) {
				reserve = avail;
			}
			
			res.reserve = reserve;
			perTick -= reserve;

			resources.addRes(i, perTick);
		}

		//handle consumption
		for (let j = 0; j < resPool.length; j++) {
			let res = resPool[j];
			//confirm resource is unlocked and not hidden
			if (res.isUnlocked == false || res.hidden == true) {
				continue;
			}			
			//get amount consumed
			let perTick = effectsManager.cache[res.name + "PerTickConsumption"] || 0;

			if (res.reserve - perTick > 0) {
				res.reserve -= perTick;
			}
			else {
				res.reserve = 0;
			}	
		}
		//handle conversion
		let conv = effectsManager.conversionCache;
		for (let k = 0; k < conv.length; k++) {
			let effect = conv[k];
			let type = effect.con;
			switch(type) {
				case "call":
					effect.call();
					break;
				case "basic":
					//check if multi is zero, exit
					if (effect.numUnits == 0) {
						continue;
					}

					//find reserve
					devMsg("called basic conversion");
					let source = resources.stack[resources.findResInStack(effect.sourceName)];

					//calculate whether full amount is available
					let fullCall = effect.sourceAmount * effect.numUnits;
					let called = (fullCall <= source.reserve) ? effect.numUnits : Math.floor((source.reserve / effect.sourceAmount));

					//withdraw appropriate amount from reserve
					let calledAmount = called * effect.sourceAmount;
					source.reserve -= calledAmount;

					//generate conversion resources
					let newRes = resources.findResInStack(effect.creates);
					let amountAdded = called * effect.value;

					resources.addRes(newRes, amountAdded);		
					break;
				default:
					msg("hit default, something went wrong")
					break;
			}

			
			//			msg("reached end of switch");
				/*	
				
							newConversion.effect = effects[j].effect;
							newConversion.value = effects[j].value;
							newConversion.con = effects[j].con;
							newConversion.sourceName = effects[j].sourceName;
							newConversion.sourceAmount = effects[j].sourceAmount;
							newConversion.numUnits = multi;
							 
				effect: "sustenancePerTick", value: 0.25, con: "call", type: "inactive",
				    call: function(multi) 


							newConversionA.effect = effects[j].effect;
							newConversionA.value = effects[j].value;
							newConversionA.con = effects[j].con;
							newConversionA.sourceName = effects[j].sourceAmount;
							newConversionA.numUnits = multi;
							newConversionA.call = effects[j].call; 
							
							
							*/
		}

		//FLAG -- CRAFTING GOES HERE
		
		//restore unused reserves
		for (let m = 0; m < resPool.length; m++ ) {
			let res = resPool[m];
			let restore = res.reserve || 0;
//			msg("restore amount is at " + restore);
			if (restore > 0) {
				msg(res.name + " reserve is currently at " + restore + ", restoring resources");
				resources.addRes(res.name, restore);
			}
		}

		
		// a bunch of stuff is needed here to calculate pertick values for all resources
		// likely a for loop
		// the code below is specifically for pustules and sustenance only
/*		let perTickValue = 0;
		let availableSus = this.stack[2].current + perTickValue;
		let subtract = swamp.stack[1].fillPus(availableSus);
		this.stack[2].current = this.stack[2].current + perTickValue - subtract; */ 	// FLAG FOR DELETION
	}
	perTickChance(res) {
//		console.log("called pertickchance for " + res.name);
		let chance = (effectsManager.cache[res.name + "PerTickChance"]) ? effectsManager.cache[res.name + "PerTickChance"] : 0;
		let value = 0;
		if (chance > 0 ) {
			if (chance >= Math.random()) {
				let max = effectsManager.cache[res.name + "PerClickChanceMax"];
				value = randomInt(1, max);
				if (game.currentPhase == 0 && res.name == "prey") {
					msg("Your traps have captured " + value + " prey.");
				} else if (game.currentPhase == 0 && res.name == "native") {
					msg("Your traps have captured " + value + " native.");
				}
			}
		}
		return value;
	}


	
} // --- close resources object --- //

// --- start research object --- //

/*

		{ name: 
		  label: 
		  desc: 
		  flavor: 
		  costs: [],
		  purchased: 
		  actions: [],
		  effects: [],
		  unlocks: []
		}
*/



let research = {};
class TechBase {
	name = "research";
	stack;
	constructor() {
		this.stack = [
			{ name: "calendar",
			  label: "Calendar",
			  desc: "Discover the world's cyclical cycle.",
			  flavor: "now we can invent the weekend",
			  costs: [
				  { name: "corruption", amount: 10 }
			  ],
			  purchased: false,
			  stackable: false,
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
			  stackable: false,
			  lockedBy: [
				  { type: "tech", name: "calendar" }
			  ],
			  actions: [],
			  effects: [
				  { effect: "woodcutterJobPerTick", value: 1 }
			  ],
			  unlocks: []
			}
		]
	}
}

/* const researchBase = {
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
}; */
	




// --- close science object --- //


let effectsManager = {};
class EffectsManagerBase {
	swampEffectsCache = [];
	swampConversionCache = [];
	researchEffectsCache = [];
	cache = {};
	conversionCache = [];
	
	constructor() {}
	getEffectStack(source) {
		let stack = source.stack;
		let buildEffects = [];
		let tempCon = [];
		for (let i = 0; i < stack.length; i++) {
			let effects = stack[i].effects;
			if (!effects) { 
				continue;
			}
			let stackable = (stack[i].stackable) ? true : false;
			for (let j = 0; j < effects.length; j++) {
				let newEffect = {};
				newEffect.effect = effects[j].effect;
				let getValue = effects[j].value;
				if (stackable && !("type" in effects[j])) {
					effects[j].type = "stack";
				}
				let multi = 1;

				if ("type" in effects[j]) {
					let type = effects[j].type;
					switch (type) {
						case "active":
							multi = stack[i].active;
							break;
						case "inactive":
							multi = stack[i].count - stack[i].active;
							break;
						case "stack":
							multi = stack[i].count;
							break;
						case "nostack":
							break;
						default:
							msg("effect type " + type + "not found");
							break;
					}
				}

				if ("con" in effects[j]) {
					newEffect.effect += "Conversion";
					let con = effects[j].con;
					switch (con) {
						case "basic":			//consume one resource reserve, add another resource
							//check if multi is zero, don't add to conversion stack
							if (multi === 0) {
								continue;
							}
	
							let newConversion = {};
							
							newConversion.effect = effects[j].effect;
							newConversion.value = effects[j].value;
							newConversion.con = effects[j].con;
							newConversion.sourceName = effects[j].sourceName;
							newConversion.sourceAmount = effects[j].sourceAmount;
							newConversion.numUnits = multi;
							newConversion.creates = effects[j].creates;

							tempCon.push(newConversion);

							break;
						case "multi":			//consume multiple resource reserves, add another resource
							break;
						case "call":			//call a special function
							let newConversionA = {};
							
							newConversionA.effect = effects[j].effect;
							newConversionA.value = effects[j].value;
							newConversionA.con = effects[j].con;
							newConversionA.sourceName = effects[j].sourceName;
							newConversionA.sourceAmount = effects[j].sourceAmount;
							newConversionA.numUnits = multi;
							newConversionA.call = effects[j].call;

							tempCon.push(newConversionA);
							
							break;
						default:
							msg("conversion type " + con + " not found");
							break;
					}
				}
				
/*				  { effect: "preyPerTickReserve", value: 0.25 },
				  { effect: "sustenancePerTickConversion", value: 0.5, con: "basic", sourceName: "prey", sourceAmount: 0.25, creates: "sustenance" }
*/
				

/*				if ("type" in effects[j]) {
					let type = effects[j].type;
					switch (type) {
						case "active":
							newEffect.value = getValue * stack[i].active;
							break;
						case "inactive":
							newEffect.value = getValue * (stack[i].count - stack[i].active);
							break;
						case "stack":
							newEffect.value = getValue * stack[i].count;
							break;
						default:
							msg("effect type " + type + "not found");
							break;
					}
				} else if (stackable == true) {
					newEffect.value = getValue * stack[i].count;
				} else { newEffect.value = getValue; } */

				newEffect.value = effects[j].value * multi;
				buildEffects.push(newEffect);
			}
		}
		this[source.name + "EffectsCache"] = buildEffects;
		if (tempCon.length > 0) { this[source.name + "ConversionCache"] = tempCon; }
		
		
		//take a stack, review buttons, produce an array of effect values as objects
		//each value is calculated based upon number of buildings, etc.
		//store this value in the applicable effectsCache
	}
	getAllCache() {
		//grab base effects from resources object
		let baseCache = resources.effectsBase;

		//grab effects from each of the caches
		let swampCache = effectsManager.swampEffectsCache;
		let researchCache = effectsManager.researchEffectsCache;
		//additional caches here
		
		//make a combined array
		let combinedArray = [...baseCache, ...swampCache, ...researchCache];
		
		//temporary code to check what is happening
/*		let text = "";
		for ( let i = 0; i < combinedArray.length; i++ ) {
			text += Object.entries(combinedArray[i]) + "<br />";
			msg(i);
		}
		msg(text);
*/
		//clear cache object
		this.cache = {};
		
		//assemble into a final object of all properties
		//set effects property to {}

		for (let j = 0; j < combinedArray.length; j++) {
			let entry = combinedArray[j];
			let test = (entry.effect in this.cache);
			if ( test === true ) {
				this.cache[entry.effect] += entry.value;
			} else {
				this.cache[entry.effect] = entry.value;
			}
		}

		//combine conversion caches
		this.conversionCache = [...this.swampConversionCache];
		
		/* 
let test = { try: "age" };

const person = {
  firstName: "John",
  lastName : "Doe",
  age      :  50
};

let result = (test.try in person);

if (result == true) { person.test.try += 25 };
*/

		
		//FOR loop through combined array
			//each item, check for additional calculations
			//finalize into either property and value or two values in array
			//check to see if property exists in effectsManager.effects
				//if it does, add value to existing value
				//if it does not, add property and add value
		//should produce an effects object consisting of a variety of properties corresponding to the effects values from all buttons etc.

	}
	cacheCycle() {
		effectsManager.getEffectStack(swamp);
		effectsManager.getEffectStack(research);
		effectsManager.getAllCache();
	}
	
}





function findBldgInSwamp(name) { 	//FLAG for deletion
	let findName = name;
	for (let i = 0; i < swamp.stack.length; i++) {
		if (swamp.stack[i].name == findName) {
			return i;
		}
	}
}

// -- start loading items here -- //

function loadGame() {	//runs at end of HTML load
	swamp = new SwampBase();
	resources = new ResourcesBase();
	game = new GameBase();
	research = new TechBase();
	effectsManager = new EffectsManagerBase();
	effectsManager.cacheCycle();
	game.buildNav();
	timing.activateBelt();
	resources.loadResPanelNew();
//	resources.loadResourcePanel();
	setDevButtonsDynamic();
	buildGrid(swamp, swamp.stack);	//need to update to define by phase when loading game/refreshing from LocalStorage
	msg("You have awakened...");	
}

// -- end loading items -- //

function round3(number) {
	let numNum = Math.round(number * 1000);
	numNum = numNum / 1000;
	return numNum;
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getContentCosts(stack, num) {
	devMsg("getContentCosts called");
	
	let prices = stack.stack[num].costs;
	let dispCost = "";
	if (!prices) return dispCost;
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

//		let actCheck = ("active" in stack.stack[num]);
//		let inact = stack.stack[num].count - stack.stack[num].active;
//		devMsg("stack count is " + stack.stack[num].count + " and inactive count is " + stack.stack[num].inactive);
//		let act = (stack.stack[num].inactive > 0) ? stack.stack[num].count - stack.stack[num].inactive + "/" : "";
//		let act = (actCheck === true) ? stack.stack[num].active + "/" : "";

		let act = ("active" in stack.stack[num]) ? stack.stack[num].active + "/" : "";
		newLabel += " (" + act + stack.stack[num].count + ")";
		document.getElementById(stack.name + num + "Label").innerHTML = newLabel;
	}
	if (stack.stack[num].costs) {
		let AC = "";
		devMsg("updateLabel now checking costs for button highlighting");
		if (resources.checkCostsByArray(stack.stack[num].costs, stack.stack[num].count).result == "pass") {
			AC = "active";
		}
		let target = document.getElementById(stack.name + num + "Collapsible");
		if (target.classList.contains("active") && AC != "active") {
			target.classList.remove("active");
		}
		else if (!(target.classList.contains("active")) && AC == "active") {
			target.classList.add("active");
		}
	} 
}

function updateContentCosts(num) {		//FLAG -- is anything calling for this? if not, delete
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
//	beltSpeed: 1000,
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
	pauseBelt: function() {
		clearInterval(this.beltTimer);
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

		//call functions every tick
		resources.updatePerTick();
		resources.loadResPanelNew();

		//call functions based upon belt value - SWITCH FUNCTION

		switch(this.beltStep) {
			case 0:
				break;
			case 1:
				devMsg("beltstep 1");
				effectsManager.cacheCycle();
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
				effectsManager.cacheCycle();
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
				effectsManager.cacheCycle();
				break;
			case 10:
				this.callBuild();
				break;
			case 11:
			case 12:
				break;
			case 13:
				effectsManager.cacheCycle();
				break;
			case 14:
			case 15:
				break;
			case 16:
				calendar.updateCal();
				break;
			case 17:
				effectsManager.cacheCycle();
				break;
			case 18:
			case 19:
				break;
			case 20:
				this.callBuild();
				break;
			case 21:
				effectsManager.cacheCycle();
				break;
			case 22:
			case 23:
				break;
			case 24:
				calendar.updateCal();
				break;
			case 25:
				effectsManager.cacheCycle();
				break;
			case 26:
			case 27:
			case 28:
				break;
			case 29:
				effectsManager.cacheCycle();
				break;
			case 30:
				this.callBuild();
				break;
			case 31:
				break;
			case 32:
				calendar.updateCal();
				break;
			case 33:
				effectsManager.cacheCycle();
				break;
			case 34:
			case 35:
			case 36:
				break;
			case 37:
				effectsManager.cacheCycle();
				break;
			case 38:
			case 39:
				break;
			case 40:
				// msg("beltStep collected" + this.beltStep);
				calendar.updateCal();
				this.callBuild();
				break;
		}
		
		//update logTime
		this.logTime = nowTime;
	},
	callBuild: function() {
		devMsg("refreshing active panel via callBuild, auto-called from timing belt");
		switch(game.activeTab) {
			case 0: //swamp
				buildGrid(swamp, swamp.stack, true);
				break;
			case 1:	//personnel
			case 2: //settlement
			case 3: //world
				break;
			case 4: //research
				buildGrid(research, research.stack, true);
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
/*	{ name: "button0",
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
	}, */
/*	{ name: "button4",
	  label: "add prey",
	  run: function() {
		  resources.stack[1].current += 5;
		  resources.loadResource(1);
		  msg("added 5 prey");
	  }
	}, */
/*	{ name: "button8",
	  label: "display pustule object",
	  run: function() { objectParseMsg(swamp[4]); }
	}, */
	{ name: "button9",
	  label: "build grid for swamp with open tabs",
	  run: function() { 
		  msg("build grid for swamp called via dev button");
		  buildGrid(swamp, swamp.stack, true); 
	  }
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
/*	{ name: "button11",
	  label: "canAddAnyRes - name",
	  run: function() {
		  let result = resources.canAddAnyRes("prey");
		  devMsg("called canAddAnyRes with resource prey by name, result: " + result);
	  }
	  
	}, */
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
	},
	{ name: "button15",
	  label: "update pustule",
	  run: function() {
		  swamp.stack[4].special.unfilled[0] += 1;
		  refreshProgAll(swamp, swamp.stack);
	  }
	},
	{ name: "button16",
	  label: "unlock all buttons on current tab",
	  run: function() { 
		  devUnlockAll(); 
	  }
	},
/*	{ name: "button17",
	  label: "How deep are the copies?",
	  run: function() {
		  let fooo = new TechBase();
		  msg("research shows that calendar purchased is " + research.stack[0].purchased + " and fooo shows that calendar purchased is " + fooo.stack[0].purchased);
	  }
	} */
	{ name: "button18",
	  label: "effectsManager cacheCycle",
	  run: function() {
		  effectsManager.cacheCycle();
	  }
	},
	{ name: "button19",
	  label: "print effects",
	  run: function() {
		  let text = "";
		  for (let [effect, value] of Object.entries(effectsManager.cache)) {
			  text += effect + ": " + value + "<br />";
		  }
		  msg(text);
	  }
	},
	{ name: "button20",
	  label: "loadResPanelNew",
	  run: function() {
		  resources.loadResPanelNew();
	  } 
	},
	{ name: "button21",
	  label: "pause game",
	  run: function() {
		  timing.pauseBelt();
	  }
	  
	},
	{ name: "button22",
	  label: "unpause game",
	  run: function() {
		  timing.activateBelt();
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


function devUnlockAll() {
	let base = "";
	let stack = "";
	switch(game.activeTab) {
	case 0: //swamp
		base = swamp;
		stack = swamp.stack;
		break;
	case 1:	//personnel
	case 2: //settlement
	case 3: //world
		break;
	case 4: //research
		base = research;
		stack = research.stack;
		break;
	}
	for (let i = 0; i < stack.length; i ++) {
		stack[i].isUnlocked = true;
	}
	buildGrid(base, stack, true);	
}





//-- start interval timer --//
//-- this should probably be an object --//
//let gameTimer = setInterval(tick, calendar.runSpeed);		// FLAG for deletion after full integration with belt
// 	function tick() {
//	msg("tick");
//	resources.updatePerTick();
//	resources.loadResourcePanel();
//	calendar.updateCal();
//	}

//-- end interval timer --//

function toggleActive(e) {
	const targetPanelId = e.target.getAttribute('data-target');
	const targetPanel = document.getElementById(targetPanelId);
	const activePanels = document.getElementsByClassName('active');
	if (activePanels) {
		activePanels[0].classList.toggle('active'); /* hides everything */
	} 
	targetPanel.classList.toggle('active');
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

// loadGame();
