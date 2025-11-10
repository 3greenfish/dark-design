	
	
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
