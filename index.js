let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
// all the blue/red variable names are wrong
// don't care

// now playing
let mapContainer = document.getElementById("mapContainer");
let mapTitle = document.getElementById("mapTitle");
let mapDifficulty = document.getElementById("mapDifficulty");

// team names
let blueName = document.getElementById("blueName");
let redName = document.getElementById("redName");

// team points
let blueStars = document.getElementById("blueStars");
let redStars = document.getElementById("redStars");

// gameplay mode
let blueScore = document.getElementById("blueScore");
let redScore = document.getElementById("redScore");

// chat
let chats = document.getElementById("chats");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    blueScore:  new CountUp('blueScore', 0, 0, 2, .2, {suffix: "%", useEasing: true, useGrouping: true,   separator: ",", decimal: "." }),
    redScore:  new CountUp('redScore', 0, 0, 2, .2, {suffix: "%", useEasing: true, useGrouping: true,   separator: ",", decimal: "." }),
}

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};



let tempImg;
let tempMapName;
let tempMapDiff;
let ar;
let od;
let cs;
let sr;
let bpm; 
let len;



let chatLen = 0;
let tempClass = 'unknown';

let bestOf;
let firstTo;
let scoreVisible;
let starsVisible;
let starsBlue;
let starsRed;
let scoreBlue;
let scoreRed;
let nameBlue;
let nameRed;

let maps = "";
let currentpick = 'r';
let lastcmd;


// this variable naming scheme fucking sucks

socket.onmessage = event => {
    let data = JSON.parse(event.data);
	if(scoreVisible !== data.tourney.manager.bools.scoreVisible) {
		scoreVisible = data.tourney.manager.bools.scoreVisible;
		if(scoreVisible) {
			chats.style.opacity = 0;
			blueScore.style.opacity = 1;
			redScore.style.opacity = 1;
			document.getElementById("footerGameplay").style.opacity = 1;
		} else {
			loadHist();
			chats.style.opacity = 1;
			blueScore.style.opacity = 0;
			redScore.style.opacity = 0;
			document.getElementById("footerGameplay").style.opacity = 0;
		}
	}
	if(starsVisible !== data.tourney.manager.bools.starsVisible) {
		starsVisible = data.tourney.manager.bools.starsVisible;
		if(starsVisible) {
			blueStars.style.opacity = 1;
			redStars.style.opacity = 1;

		} else {
			blueStars.style.opacity = 0;
			redStars.style.opacity = 0;

		}
	}
	if(tempImg !== data.menu.bm.path.full){
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25').replace(/\\/g,'/');
        mapContainer.style.backgroundImage = `url('http://` + location.host + `/Songs/${data.menu.bm.path.full}')`;
    }
    if(tempMapName !== data.menu.bm.metadata.title){
        tempMapName = data.menu.bm.metadata.title;
        mapTitle.innerHTML = tempMapName;

    }
    if(tempMapDiff !== '[' + data.menu.bm.metadata.difficulty + ']'){
        tempMapDiff = '[' + data.menu.bm.metadata.difficulty + ']';
        mapDifficulty.innerHTML = tempMapDiff;
    }
	if (ar !== data.menu.bm.stats.AR) {
		ar = data.menu.bm.stats.AR;
		document.getElementById("ar").innerHTML = ar;
	}
	if (cs !== data.menu.bm.stats.CS) {
		cs = data.menu.bm.stats.CS;
		document.getElementById("cs").innerHTML = cs;
	}
	if (od !== data.menu.bm.stats.OD) {
		od = data.menu.bm.stats.OD;
		document.getElementById("od").innerHTML = od;
	}
	if (sr !== data.menu.bm.stats.SR) {
		sr = data.menu.bm.stats.SR;
		document.getElementById("sr").innerHTML = sr;
	}
	if (bpm !== data.menu.bm.stats.BPM.max) {
		bpm = data.menu.bm.stats.BPM.max;
		document.getElementById("bpm").innerHTML = bpm;
	}
	if (len !== data.menu.bm.time.mp3) {
		len = data.menu.bm.time.mp3;
		rawlength = len/1000;
		let mins = Math.trunc(rawlength/60);
		let secs = Math.trunc(rawlength%60);
		let songlength = mins.toString();
		songlength += ":"
		songlength += secs.toString().padStart(2, '0');
		document.getElementById("len").innerHTML = songlength;
	}

	if(bestOf !== data.tourney.manager.bestOF) {
		let newmax = Math.ceil(data.tourney.manager.bestOF / 2);
		if (bestOf === undefined) {
			for (let i = 1; i <= newmax; i++) {
				let nodeBlue = document.createElement("div");
				let nodeRed = document.createElement("div");
				nodeBlue.className="star";
				nodeRed.className="star";
				nodeBlue.id= "blue" + i.toString();
				nodeRed.id= "red" + i.toString();
				document.getElementById("blueStars").appendChild(nodeBlue);
				document.getElementById("redStars").appendChild(nodeRed);
			}
			
		}
		if (bestOf < data.tourney.manager.bestOF) {
			for (let i = firstTo + 1; i <= newmax; i++) {
				let nodeBlue = document.createElement("div");
				let nodeRed = document.createElement("div");
				nodeBlue.className="star";
				nodeRed.className="star";
				nodeBlue.id= "blue" + i.toString();
				nodeRed.id= "red" + i.toString();
				document.getElementById("blueStars").appendChild(nodeBlue);
				document.getElementById("redStars").appendChild(nodeRed);

			}
		} else {
			for (let i = firstTo; i > newmax; i--) {
				let nodeBlue = document.getElementById("blue" + i.toString());
				let nodeRed = document.getElementById("red" + i.toString());
				document.getElementById("blueStars").removeChild(nodeBlue);
				document.getElementById("redStars").removeChild(nodeRed);

			}
		}
		bestOf = data.tourney.manager.bestOF;
		firstTo = newmax;
		loadHist();

	}

	if(starsBlue !== data.tourney.manager.stars.left) {


		if (data.tourney.manager.stars.left === starsBlue + 1) {
			maps += 'r';
			togglePick();
			loadHist();
		}
		if (data.tourney.manager.stars.left === starsBlue - 1 && maps.length > 0) {
			maps = maps.substring(0, maps.length - 1);
			togglePick();
			loadHist();
		}
		starsBlue = data.tourney.manager.stars.left;

		// this is not efficient but I don't care and it doesn't matter
		for (let i = 1; i <= starsBlue; i++) {
			document.getElementById("red" + i.toString()).style.opacity = 1;
		}
		for (let i = starsBlue + 1; i <= firstTo; i++) {
			document.getElementById("red" + i.toString()).style.opacity = 0.25;
		}
		
	}
	if(starsRed !== data.tourney.manager.stars.right) {
		if (data.tourney.manager.stars.right === starsRed + 1){
			maps += 'b';
			togglePick();
			loadHist();
		}
		if (data.tourney.manager.stars.right === starsRed - 1 && maps.length > 0) {
			maps = maps.substring(0, maps.length - 1);
			togglePick();
			loadHist();
		}
		starsRed = data.tourney.manager.stars.right;
		// this is not efficient but I don't care and it doesn't matter
		for (let i = 1; i <= starsRed; i++) {
			document.getElementById("blue" + i.toString()).style.opacity = 1;
		}
		for (let i = starsRed + 1; i <= firstTo; i++) {
			document.getElementById("blue" + i.toString()).style.opacity = 0.25;
		}
	}
	
	if(nameBlue !== data.tourney.manager.teamName.left) {
		nameBlue = data.tourney.manager.teamName.left;
		blueName.innerHTML = nameBlue;
	}
	if(nameRed !== data.tourney.manager.teamName.right) {
		nameRed = data.tourney.manager.teamName.right;
		redName.innerHTML = nameRed;
	}
	if(scoreVisible) {
		let tempBlue = (data.tourney.ipcClients[0].gameplay.accuracy + data.tourney.ipcClients[1].gameplay.accuracy)/2;
		let tempRed = (data.tourney.ipcClients[2].gameplay.accuracy + data.tourney.ipcClients[3].gameplay.accuracy)/2;

		if (tempRed >= 0 && tempRed <= 100)
			scoreRed = tempRed;
		if (tempBlue >= 0 && tempBlue <= 100)
			scoreBlue = tempBlue;


		animation.blueScore.update(scoreBlue);
		animation.redScore.update(scoreRed);

		if(scoreBlue > scoreRed) {
			// Blue is Leading
			blueScore.style.fontFamily = "Montserrat-Bold";
			redScore.style.fontFamily = "Montserrat-Regular";
			
		} else if (scoreBlue == scoreRed) {
			// Tie
			blueScore.style.fontFamily = "Montserrat-Regular";
			redScore.style.fontFamily = "Montserrat-Regular";
		} else {
			// Red is Leading
			blueScore.style.fontFamily = "Montserrat-Regular";
			redScore.style.fontFamily = "Montserrat-Bold";
			
		}
	}
	if(!scoreVisible) {


		if(chatLen != data.tourney.manager.chat.length) {
			// There's new chats that haven't been updated
			
			if(chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
				// Starts from bottom
				chats.innerHTML = "";
				chatLen = 0;
			}
			
			// Add the chats
			for(var i=chatLen; i < data.tourney.manager.chat.length; i++) {

				if (data.tourney.manager.chat[i].messageBody.startsWith('?')) {
					if (chatLen != 0 && data.tourney.manager.chat[i].team === 'unknown') {
						let body = data.tourney.manager.chat[i].messageBody;
						if (body.startsWith("?setmaps")) {
							let letters = /^([rb])+$/;
							let param = body.substring(9, body.length);
							if (letters.test(param) && param.length <= bestOf) {
								maps = param;
								loadHist();
							}
						}
						if (body.startsWith("?setpick")) {
							let param = body.substring(9, body.length);
							if (param === 'r' || param === 'b') {
								currentpick = ((param ==='r') ? 'r' : 'b');
								document.getElementById("nextPick").style.backgroundColor = (currentpick === 'r' ? "#F03030" : "#1871D9");
							}
						}
					}
				} else {
					tempClass = data.tourney.manager.chat[i].team;
				
					// Chat variables
					let chatParent = document.createElement('div');
					chatParent.setAttribute('class', 'chat');
	
					let chatTime = document.createElement('div');
					chatTime.setAttribute('class', 'chatTime');
	
					let chatName = document.createElement('div');
					chatName.setAttribute('class', 'chatName');
	
					let chatText = document.createElement('div');
					chatText.setAttribute('class', 'chatText');
					
					chatTime.innerText = data.tourney.manager.chat[i].time;
					chatName.innerText = data.tourney.manager.chat[i].name + ":\xa0";
					chatText.innerText = data.tourney.manager.chat[i].messageBody;
					
					chatName.classList.add(tempClass);
					
					chatParent.append(chatTime);
					chatParent.append(chatName);
					chatParent.append(chatText);
					chats.append(chatParent);
				}
				
			}
			
			// Update the Length of chat
			chatLen = data.tourney.manager.chat.length;
			
			// Update the scroll so it's sticks at the bottom by default
			chats.scrollTop = chats.scrollHeight;
		}
	}
}

loadHist = () => {
	// rerender the whole thing lol
	// this should work without having to manually pass in the number of maps, but it doesn't
	let hist = document.getElementById("mapHistory");
	hist.innerHTML = '';
	if (bestOf !== undefined) {
		for (let i = 0; i < maps.length; i++) {
			let node = document.createElement("div");
			let type = "mapPick-";
			type += bestOf.toString();
			node.className = type;
			node.style.backgroundColor = (maps[i] === 'r' ? "#F03030" : "#1871D9")
			document.getElementById("mapHistory").appendChild(node);
		}
		for (let i = maps.length; i < bestOf; i++) {
			let node = document.createElement("div");
			let type = "mapPick-";
			type += bestOf.toString();
			node.className = type;
			node.style.backgroundColor = "#DADADA"
			document.getElementById("mapHistory").appendChild(node);
		}
	}
}

togglePick = () => {
	if (currentpick !== undefined) {
		let node = document.getElementById("nextPick");
		currentpick = (currentpick === 'r' ? 'b' : 'r');
		node.style.backgroundColor = (currentpick === 'r' ? "#F03030" : "#1871D9")
	}
}
