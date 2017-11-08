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





class Adder {
	constructor() {

		this.buttons = [
			{
				text: "Test 1",
				font: "20px Verdana",
				rect: {x:800, y:80, h:35, w:200},
				action: function() {
					for (var i=0; i<1; i++) {
						main.adder.train();
					}
				}
			},{
				text: "Test 10x",
				font: "20px Verdana",
				rect: {x:800, y:120, h:35, w:200},
				action: function() {
					for (var i=0; i<10; i++) {
						main.adder.train();
					}
				}
			},{
				text: "Test 100x",
				font: "20px Verdana",
				rect: {x:800, y:160, h:35, w:200},
				action: function() {
					for (var i=0; i<100; i++) {
						main.adder.train();
					}
				}
			},{
				text: "Test 1,000x",
				font: "20px Verdana",
				rect: {x:800, y:200, h:35, w:200},
				action: function() {
					for (var i=0; i<1000; i++) {
						main.adder.train();
					}
				}
			},{
				text: "<",
				font: "20px Verdana",
				rect: {x:330, y:580, h:30, w:30},
				action: function() {
					main.adder.graphScale = Math.round(main.adder.graphScale/10);
					main.adder.graphScale = Math.max(main.adder.graphScale, 1);
				}
			},{
				text: ">",
				font: "20px Verdana",
				rect: {x:500, y:580, h:30, w:30},
				action: function() {
					main.adder.graphScale = Math.round(main.adder.graphScale*10);
				}
			},{
				text: "<",
				font: "20px Verdana",
				rect: {x:90, y:580, h:30, w:30},
				action: function() {
					main.adder.graphStart = Math.max(main.adder.graphStart-1, 0);
				}
			},{
				text: ">",
				font: "20px Verdana",
				rect: {x:130, y:580, h:30, w:30},
				action: function() {
					main.adder.graphStart ++;
				}
			}
		];



		// Neural Network
		this.nn = new Neural_Network([2,3,3,1]);


		this.errorList = [];
		this.errorGraph = {x:20+59, y:59, w:700, h:512};

		this.graphScale = 1;
		this.graphStart = 0;	// Number to start graph at


	}
	render() {
		fillCanvas("lightgrey");

		drawText("Adder Mode", canvas.width/2, 25, 20, "black", "center");


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
		
		let IOPairs = [];
		for (let i=0; i<10; i++) {
			let input = [Math.random(), Math.random()];
			let expected = [input[0] + input[1] - 1];
			IOPairs.push([input,expected])
		}

		let error = this.nn.train(IOPairs);
		this.errorList.push(error);
		//console.log(error);
		

		//console.log("New: ", main.nn.getOutput(x)[0]+1);


	}
	test(input) {

		let output = this.nn.getOutput(input);
		console.log(output[0]+1)


	}
}

function graph(data, rect) {

	drawRect(rect);

	drawText(0, rect.x-5, rect.y+rect.h+20, 20, "black", "right");
	drawText(data.length, rect.x+rect.w-5, rect.y+rect.h+20, 20, "black", "right");

	let maxY = 0;
	for (var i=0; i<data.length; i++) {
		maxY = Math.max(maxY, data[i]);
	}

	drawText(maxY.toFixed(2), rect.x-5, rect.y+20, 20, "black", "right");

	ctx.lineCap = "round"
	ctx.lineWidth = 3;
	ctx.strokeStyle = "red";
	ctx.beginPath();
	for (var i=0; i<data.length; i++) {
		let plotPos = {
			x: rect.x + rect.w * (i/(data.length-1)),
			y: rect.y + rect.h * (1 - data[i]/maxY)
		}
		
		if (i==0) {
			ctx.moveTo(plotPos.x, plotPos.y);
		}
		ctx.lineTo(plotPos.x, plotPos.y);
	}
	//ctx.closePath();
	ctx.stroke();


}

