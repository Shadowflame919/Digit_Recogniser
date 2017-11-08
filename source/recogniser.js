/*

	ctx.fillStyle = "#999999";
	ctx.fillRect(x, y, w, h);
	ctx.fillText("Hello World", x, y);

	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	ctx.fill();

	ctx.textAlign = "left";
	ctx.font = "bold 35px Verdana";

	ctx.beginPath();
	ctx.moveTo(canvas.width*0.5-10, canvas.height*0.5);
	ctx.lineTo(canvas.width*0.5+10, canvas.height*0.5);
	ctx.closePath();
	ctx.stroke();


	if (main.keyDown["Space"]) {}
	"ShiftLeft" "KeyW" "KeyS" "KeyD" "KeyA"

*/

/*


	




*/





class Recogniser {
	constructor() {

		this.uploadButtonRect = {x:800, y:450, h:35, w:200};

		this.buttons = [
			{
				text: "Test 1x",
				font: "20px Verdana",
				rect: {x:800, y:80, h:35, w:200},
				action: function() {
					for (var i=0; i<1; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "Test 10x",
				font: "20px Verdana",
				rect: {x:800, y:120, h:35, w:200},
				action: function() {
					for (var i=0; i<10; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "Test 100x",
				font: "20px Verdana",
				rect: {x:800, y:160, h:35, w:200},
				action: function() {
					for (var i=0; i<100; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "Test 1000x",
				font: "20px Verdana",
				rect: {x:800, y:200, h:35, w:200},
				action: function() {
					for (var i=0; i<1000; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "Test 10000x",
				font: "20px Verdana",
				rect: {x:800, y:240, h:35, w:200},
				action: function() {
					for (var i=0; i<10000; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "Test 100000x",
				font: "20px Verdana",
				rect: {x:800, y:280, h:35, w:200},
				action: function() {
					for (var i=0; i<100000; i++) {
						main.recogniser.train();
					}
				}
			},{
				text: "<",
				font: "20px Verdana",
				rect: {x:330, y:580, h:30, w:30},
				action: function() {
					main.recogniser.graphScale = Math.round(main.recogniser.graphScale/10);
					main.recogniser.graphScale = Math.max(main.recogniser.graphScale, 1);
				}
			},{
				text: ">",
				font: "20px Verdana",
				rect: {x:500, y:580, h:30, w:30},
				action: function() {
					main.recogniser.graphScale = Math.round(main.recogniser.graphScale*10);
				}
			},{
				text: "<",
				font: "20px Verdana",
				rect: {x:90, y:580, h:30, w:30},
				action: function() {
					//main.recogniser.graphStart = Math.round(main.recogniser.graphStart - 10*main.recogniser.graphScale);
					//main.recogniser.graphStart = Math.max(main.recogniser.graphStart, 0);
					main.recogniser.graphStart = Math.max(main.recogniser.graphStart-1, 0);
				}
			},{
				text: ">",
				font: "20px Verdana",
				rect: {x:130, y:580, h:30, w:30},
				action: function() {
					//main.recogniser.graphStart = Math.round(main.recogniser.graphStart + 10*main.recogniser.graphScale);
					main.recogniser.graphStart ++;
				}
			},{
				text: "Download Network",
				font: "20px Verdana",
				rect: {x:800, y:400, h:35, w:200},
				action: function() {
					console.log("Downloading Recogniser");
					main.recogniser.downloadNetwork();
				}
			},{
				text: "Upload Network",
				font: "20px Verdana",
				rect: this.uploadButtonRect,
				action: function() {}	// Actual function gets run inside of the canvas .click() event because javascript sucks
			}
		];


		// Neural Network
		this.nn = new Neural_Network([256,16,16,10]);


		this.errorList = [];
		this.errorGraph = {x:20+59, y:59, w:700, h:512};

		this.graphScale = 1;
		this.graphStart = 0;	// Number to start graph at

		this.trainingGroupSize = 50;		// Number of training examples used per tweak to the network


	}
	render() {
		fillCanvas("lightgrey");

		drawText("Recogniser Mode", canvas.width/2, 25, 20, "black", "center");


		let averagedData = [];
		for (var i=this.graphScale-1; i<this.errorList.length; i+=this.graphScale) {
			let avg = 0;
			for (var j=0; j<this.graphScale; j++) {
				avg += this.errorList[i-j];
			}
			averagedData.push(avg/this.graphScale);
		}
		graph(averagedData, this.errorGraph, this.graphStart);

		drawText(this.graphScale + "x scale", this.errorGraph.x+this.errorGraph.w/2, this.errorGraph.y+this.errorGraph.h+25, 20, "black", "center");


		// Render buttons
		for (var i in this.buttons) {
			if (pointInRect(main.mousePos, this.buttons[i].rect)) {
				ctx.fillStyle = "#777777";
			} else {
				ctx.fillStyle = "#999999";
			}
			ctx.fillRect(this.buttons[i].rect.x, this.buttons[i].rect.y, this.buttons[i].rect.w, this.buttons[i].rect.h);

			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.font = this.buttons[i].font;
			ctx.fillText(this.buttons[i].text, this.buttons[i].rect.x + this.buttons[i].rect.w/2, this.buttons[i].rect.y+this.buttons[i].rect.h-10);
		}
		
	}
	update() {




		if (main.mouseClicked) {
			// Test for clicks in buttons
			for (var i in this.buttons) {
				if (pointInRect(main.mousePos, this.buttons[i].rect)) {
					this.buttons[i].action();
					main.mouseClicked = false;
					break;
				}
			}
		}

	}
	train() {

		let digitIndexList = [];
		for (var i=0; i<main.digitList.length; i++) {
			digitIndexList.push(i);
		}
		while (digitIndexList.length > this.trainingGroupSize) {
			digitIndexList.splice(Math.floor(Math.random()*digitIndexList.length), 1);
		}
		

		var IOPairs = [];
		for (let n=0; n<this.trainingGroupSize; n++) {
			let randomDigit = main.digitList[digitIndexList[n]];

			let input = new Array(randomDigit.pixelList.length);
			for (var i=0; i<randomDigit.pixelList.length; i++) {
				input[i] = randomDigit.pixelList[i] / 255;
			}

			let expected = new Array(10);
			for (var i=0; i<10; i++) {
				expected[i] = (i==randomDigit.value) ? 1 : -1;
			}

			IOPairs.push([input, expected]);
		
			//console.log(randomDigit.value, error.toFixed(3));
		}

		//console.log(IOPairs)
		let error = this.nn.train(IOPairs);
		this.errorList.push(error);

	}
	test(digit) {

		let input = new Array(digit.pixelList.length);
		for (var i=0; i<digit.pixelList.length; i++) {
			input[i] = digit.pixelList[i] / 255;
		}

		let expected = Array(10);
		for (var i=0; i<10; i++) {
			expected[i] = (i==digit.value) ? 1 : -1;
		}
		//console.log("Testing: ", input);
		//console.log("Expecting ", expected[0]+1);
		//console.log("Original: ", main.nn.getOutput(x)[0]+1);

		let output = this.nn.getOutput(input);
		output = output[output.length-1];

		return output;	//(digit.value == answer)

	}
	fullTest() {

		let correct = 0;
		for (var i=0; i<main.digitList.length; i++) {
			let output = this.test(main.digitList[i]);
			let answer = 0;
			for (let j=0; j<output.length; j++) {
				if (output[j] > output[answer]) answer = j;
			}
			correct += (answer == main.digitList[i].value);
		}
		correct /= main.digitList.length;
		console.log((correct*100).toFixed(2) + "%");

	}
	downloadNetwork() {
		let textFileString = JSON.stringify(this.nn.network);
		//console.log(textFileString)
		let textFile = new Blob([textFileString], {type:"text/plain"});
		let downloadLink = document.createElement("a");
		downloadLink.href = URL.createObjectURL(textFile);
		downloadLink.download = "network.txt";
		document.body.append(downloadLink);
		downloadLink.click();
		downloadLink.remove();
	}
}

function graph(data, rect, start=0) {

	drawRect(rect);

	drawText(start, rect.x-5, rect.y+rect.h+20, 20, "black", "right");
	drawText(data.length, rect.x+rect.w-5, rect.y+rect.h+20, 20, "black", "right");

	let maxY = 0;
	for (var i=start; i<data.length; i++) {
		maxY = Math.max(maxY, data[i]);
	}

	drawText(maxY.toFixed(2), rect.x-5, rect.y+20, 20, "black", "right");

	ctx.lineCap = "round"
	ctx.lineWidth = 3;
	ctx.strokeStyle = "red";
	ctx.beginPath();
	for (var i=start; i<data.length; i++) {
		let plotPos = {
			x: rect.x + rect.w * (i-start)/(data.length-start-1),
			y: rect.y + rect.h * (1 - data[i]/maxY)
		}
		
		if (i==start) ctx.moveTo(plotPos.x, plotPos.y);
		else ctx.lineTo(plotPos.x, plotPos.y);
	}
	ctx.stroke();


}

