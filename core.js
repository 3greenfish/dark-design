let food = 0;
const messageArray = ["You have awakened in a new world, and your dark powers have corrupted a small bog. Time to fester..."];

// ---- phase 1 buildings, replace with object stack later ---- //

let swells = 0; 
let pustules = 0;
let traps = 0; 

// ---- end phase 1 buildings ---- //

const resourceStack = [
	{ name: "corruption",
	  label: "Corruption",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0,
	  gatherRate: 1,
	  updateGatherRate: function() {
		  this.gatherRate = 1 + (0.1 * swells);
		  _PostMessage("Amount per fester is now " + this.gatherRate + " per click.");
	  },
	  updatePerTick: function() {
		  this.perTick = 1; // need to define logic.
		  _PostMessage("Amount per tick is now " + this.perTick + " per click.");
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
		_PostMessage("Amount per fester is now " + corruptionAdd + " per click.");
	}
}
// --- end --- //


let testText = messageArray.toString();
let jsUpdateTime = "10-26 653pm";

function updateJStime() { //runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	document.getElementById('messageCurrent').innerText = testText;
}


function loadResourceTest(resource) {
	let resName = resourceStack[resource].name;
	_PostMessage(resName);
	let resLabel = resourceStack[resource].label;
	let findElement = resName + "Current";
	_PostMessage(findElement);

	document.getElementById(resName + 'Current').innerText = resourceStack[resource].current;
	if (resourceStack[resource].limited) {
		_PostMessage ("is limited");
		let resMax = "/" + resourceStack[resource].max;
		if (resName == "size") {
			resMax += " m2";
		}
		document.getElementById(resName + 'Max').innerText = resMax;
	} else { _PostMessage("Not limited"); }
}



function loadResourcePanel() {
	for (let i = 0; i < resourceStack.length; i++) {
		let resName = resourceStack[i].name;
		_PostMessage(resName);
	//	let resLabel = resourceStack[i].label;
	//	_PostMessage(resLabel);		
		let specificStack = resourceStack[i];
		_PostMessage("specific stack: " + specificStack.name + " " + specificStack.limited);
		_PostMessage("resource stack: " + resourceStack[i].name + " " + resourceStack[i].limited);
		
		document.getElementById(resName + 'Current').innerText = resourceStack[i].current;
		if (specificStack.limited == true) {
			let resMax = "/" + specificStack.max;
			if (resName == "size") {
				resMax += " m2";
			}
			document.getElementById(resName + 'Max').innerText = resMax;
		}
	_PostMessage("Completed " + i + "loop.");
	}
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
	_PostMessage(messageText);
}

function _PostMessage(messagetext) {
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
