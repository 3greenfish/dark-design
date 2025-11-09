let food = 0;
const messageArray = ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

// ---- phase 1 buildings, replace with object stack later ---- //

let swells = 0; 
let pustules = 0;
let traps = 0; 
let sirens = 0;

// ---- end phase 1 buildings ---- //

const resourceStack = [
	{ name: "corruption",
	  label: "Corruption",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0,
	  gatherRate: 1,
// -- updateGatherRate and updatePerTick are untested -- //
	  gather: function() {
		  let totalRes = this.current;
		  totalRes += this.gatherRate;
		  if (totalRes >= this.max) {
			  this.current = this.max;
		  } else {
			  this.current = totalRes;
		  }
		  loadResourceTest(0); // need to clean up this code
	  },
	  updateGatherRate: function() {
		  this.gatherRate = 1 + (0.1 * swells);
		  msg("Amount per fester is now " + this.gatherRate + " per click.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  msg("Amount per tick is now " + this.perTick + " per click.");
	  } 
	},
	{ name: "size",
	  label: "Size",
	  current: 1,
	  limited: false,
	  perTick: 0
	},
	{ name: "prey",
	  label: "Prey",
	  current: 0,
	  limited: true,
	  max: 25,
	  perTick: 0
	},
	{ name: "sustenance",
	  label: "Sustenance",
	  current: 0,
	  limited: true,
	  max: 40,
	  perTick: 0
	}];

// --- this is incorporated into the array for corruption, but consider if it's needed separately --- //
let corruptionAdd = 1;
function calcManualRes(res) {
	if (res == "corruption") {
		corruptionAdd = 1 + (0.1 * swells);
		_postMessage("Amount per fester is now " + corruptionAdd + " per click.");
	}
}
// --- end --- //

// -- start loading items here -- //

let jsUpdateTime = "11-2 902pm";

// -- end loading items -- //

function updateJStime() { //runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	document.getElementById('messageCurrent').innerText = messageArray.toString();
	loadResourcePanel();
}



function loadResourceTest(resource) {
	let resName = resourceStack[resource].name;
	let resCurrent = resourceStack[resource].current;
	if (resName == "size") {
		resCurrent += "m&178;";
	}
	document.getElementById(resName + 'Current').innerText = resCurrent;
	
	if (resourceStack[resource].limited) {
	//	_postMessage("is limited");
		let resMax = "/" + resourceStack[resource].max;
		
		document.getElementById(resName + 'Max').innerText = resMax;
	} //else { _postMessage("Not limited"); }
	// _postMessage("finished loading");
}

function loadResourcePanel() {
	for (let i = 0; i < resourceStack.length; i++) {
		let resName = resourceStack[i].name;
		let resCurrent = resourceStack[i].current;
		if (resName == "size") {
			resCurrent += "m&#178;";
		}
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
 * or buy-swell (activate purchase code for buying one swell) */

function buttonManager(event) {
	// msg("button pressed");
	let sourceButton = event.target.getAttribute('data-target');
	let actionCat = sourceButton.slice(0 , 3);
	let lvl2 = sourceButton.slice(4);
	let lvl2num = Number(lvl2);	

	if (actionCat == "gat") {
		resourceStack[lvl2num].gather();
	}

	if (actionCat == "cal") {
		calendar.updateCal();
	}

	
	// _postMessage("code finished");
}





// -- end button management and purchase code --//

// -- calendar object --//

const calendar = {
	currentTime: 0,
	runSpeed: 2000,
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
		this.calDisplay();
	},
	onNewSeason: function() {
		msg("onNewSeason triggered");
	},
	onNewYear: function() {
		msg("onNewYear triggered");
	},
	updateCalDev: function() {
		let devForceDay = this.daysPerSeason - 5;
		msg("updateCalDev triggered, days set to " + devForceDay);
		this.day = devForceDay;
		this.calDisplay();
	},
	calDisplay: function() {
		let displayDay = this.day + 1;
		let assembledCal = "Day " + displayDay + " of " + this.seasons[this.season].label + ", Year " + this.year;
		document.getElementById("calendarBlock").innerText = assembledCal;
	}
} 

//-- end calendar object --//

//-- start interval timer --//

setInterval(tick, calendar.runSpeed);

function tick() {
	msg("tick");
	calendar.updateCal();
}

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

function _postMessage(text) {
	msg(text);
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



function buttonClick(event) {
	const sourceButton = event.target.getAttribute('data-target');
	const actionType = event.target.getAttribute('data-type');
	
	if (actionType == "gather" && sourceButton == "GatherFood") {
		food += 1;
		postMessage(sourceButton,amount);
		document.getElementById("foodCurrent").innerText = food;
		/* document.getElementById("GatherFoodButton").innerHTML = "<div class=\"collapsible\" data-type=\"gather\" data-target=\"GatherFood\" id=\"GatherFoodButton\" onClick=\"buttonClick(event," + foodValue + ")\">Gather Food</div>"; */
		
	}
	
	
	
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
