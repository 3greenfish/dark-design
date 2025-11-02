let foodValue = 2;
const messageArray = ["one", "two", "three"];
let testText = messageArray.toString();

let jsUpdateTime = "10-26 653pm";

function updateJStime() {
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



function buttonClick(event, amount) {
	const sourceButton = event.target.getAttribute('data-target');
	const actionType = event.target.getAttribute('data-type');
	
	if (actionType == "gather" && sourceButton == "GatherFood") {
		foodValue += 1;
		postMessage(sourceButton,amount);
		document.getElementById("foodCurrent").innerText = foodValue;
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
