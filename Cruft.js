	
	
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



