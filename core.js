let food = 0;

const resourceStack = [
	{ name: "Corruption",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0,
	},
	{ name: "Size",
	  current: 1,
	  limited: false,
	  perTick: 0
	},
	{ name: "Prey",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0
	},
	{ name: "Sustenance",
	  current: 0,
	  limited: true,
	  max: 50,
	  perTick: 0
	}]


	

		





const myObj = {
  name: "John",
  age: 30,
  cars: [
    {name:"Ford", models:["Fiesta", "Focus", "Mustang"]},
    {name:"BMW", models:["320", "X3", "X5"]},
    {name:"Fiat", models:["500", "Panda"]}
  ]
}
		
let corruption = 0;
let size = 0;
let prey = 0;
let sustenance = 0;

let swells = 0;



let corruptionAdd = 1;


function calcManualRes(res) {
	if (res == "corruption") {
		corruptionAdd = 1 + (0.1 * swells);
		_PostMessage("Amount per fester is now " + corruptionAdd + " per click.");
	}
}



const messageArray = ["You have awakened, and your dark powers have corrupted a small bog. Time to fester..."];

let testText = messageArray.toString();

let jsUpdateTime = "10-26 653pm";

function updateJStime() { //runs at end of HTML load
	document.getElementById('jsVersion').innerText = jsUpdateTime;
	document.getElementById('messageCurrent').innerText = testText;
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
	if (messageArray.length > 5) {
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
