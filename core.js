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
		  _postMessage("Amount per fester is now " + this.gatherRate + " per click.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  _postMessage("Amount per tick is now " + this.perTick + " per click.");
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
	let sourceButton = event.target.getAttribute('data-target');
	let actionCat = sourceButton.slice(0 , 3);
	let lvl2 = sourceButton.slice(4);
	let lvl2num = Number(lvl2);	

	if (actionCat == "gat") {
		resourceStack[lvl2num].gather();
	}
	// _postMessage("code finished");
}





// -- end button management and purchase code --//

// -- calendar object --//

const calendar = {

	currentTime: 0,
	day: 0,
	season: 0,
	year: 0,
	daysPerSeason: 90,
	seasons: [
		{ name: spring,
		  modifiers: null
		},
		{ name: summer,
		  modifiers: null
		},
		{ name: fall,
		  modifiers: null
		},
		{ name: winter,
		  modifiers: null
		}],
	seasonsPerYear: 4,
	updateCal: function() {
		let newSeason = false;
		let newYear = false;
		
		this.day += 1;

		if (this.day >= this.daysPerSeason) {
			this.day -= this.daysPerSeason;
			this.season += 1;
			newSeason = true;
		}
		if (this.season >= seasonsPerYear) {
			this.season -= seasonsPerYear;
			this.year =+ 1;
			newYear = true;
		}

		//code to actually show the calendar here //

		let assembledCal = this.seasons[season].name + " " + this.day + ", " + this.year;
		_postMessage(assembledCal);

	},
	onNewSeason: function() {
	},
	onNewYear: function() {
	}
} 

//-- end calendar object --//




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
	_postMessage(messageText);
}

function _postMessage(messagetext) {
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
