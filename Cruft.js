	
	
function postMessage(event, eventValue) {
	const sourceButton = event;
	/* const messageCenter = ; */
	let messageText;
	
	if (sourceButton == "GatherFood") {
		messageText = "You have gathered " + eventValue + " food. You now have " + foodValue + " food.";
	} else {
		messageText = "You did a thing?? Wow.";
	}
	messageText = "from old postmessage:" + messageText;
	msg(messageText);
}



/*
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length, i++) {
	coll[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.display === "block") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}
	});
}*/

// --- this is incorporated into the array for corruption, but consider if it's needed separately --- //
let corruptionAdd = 1;
function calcManualRes(res) {
	if (res == "corruption") {
		corruptionAdd = 1 + (0.1 * swells);
		msg("Amount per fester is now " + corruptionAdd + " per click.");
	}
}
// --- end --- //

const defaultObject = {
	name: "Steve",
	camels: 47,
	winsome: "winsome",
	bling: function() {
		msg(this.name + "'s camels are " + this.winsome);
	}
};

const objectTesting1 = {};

// Object.assign(TO,FROM);

function applyObjectTest() {
	msg("called apply object test");
	objectParseMsg(defaultObject);

	Object.assign(objectTesting1, defaultObject);
	objectParseMsg(objectTesting1);

	msg("applyObjectTest complete");
}

function displayTestData() {
	msg("Test1: " + objectTesting1.name + " has " + objectTesting1.camels + " " + objectTesting1.winsome + " camels.");
//	msg("Test2: " + objectTesting2.name + " has " + objectTesting2.camels + " " + objectTesting2.winsome + " camels.");
	msg("default: " + defaultObject.name + " has " + defaultObject.camels + " " + defaultObject.winsome + " camels.");
	msg("now testing bling function in child object.");
	objectTesting1.bling();
}

function updateObjectTest() {
	objectTesting1.name = "Stephen";
	objectTesting1.camels = 52;
	objectTesting1.winsome = "sad";
	msg("updates completed. expected results: Stephen 52 winsome, Steve 47 sad.");
}



const swampBase = {
	name: "swamp",
	stack: [
		{ name: "swell",    //0
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
		{ name: "pustule",     //1
		  label: "Pustule",
		  count: 0,
		  costs: [
			  { name: "corruption", amount: 40 }
		  ],
		  ratio: 1.2,
		  filled: 0,
		  unfilled: [],
		  onPurchase: function() {
			  this.unfilled.push({ level: 0 });
			  this.count += 1;
			  this.updateButtonLabel();
			  this.updateRatio();
			  updateContentCosts(1);
		  },
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
			swamp.stack[num].onPurchase();
		}
	}
}
