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

	Different modes

	Mode "draw" will draw more digits and stuff

	Mode "adder" is temporary way to test neural network

	Each mode has its own class.
	Classes have thier own 'render' and 'update' and buttons etc.

	Global and local buttons.


*/





function drawCircle(x,y,radius,colour="black",type="fill",arc=[0,2*Math.PI]) {	// Type is either 'fill' or 'stroke'
	ctx.beginPath();
	ctx.arc(x, y, radius, arc[0], arc[1], false); 
	if (type == "fill") {
		ctx.fillStyle = colour;
		ctx.fill();
	} else if (type == "stroke") {
		ctx.strokeStyle = colour;
		ctx.stroke();
	}
}

function fillCanvas(colour) {
	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawText(text, x, y, size, colour="black", align="left") {
	ctx.textAlign = align;
	ctx.font = size + "px Verdana";
	ctx.fillStyle = colour;
	ctx.fillText(text, x, y);
}

function drawRect(rect, strokeColour="black", strokeSize=1, fillColour=false, center=false) {
	ctx.beginPath();
	if (center) ctx.rect(rect.x-rect.w/2, rect.y-rect.h/2, rect.w, rect.h);
	else ctx.rect(rect.x, rect.y, rect.w, rect.h);
	if (fillColour) {
		ctx.fillStyle = fillColour;
		ctx.fill();
	}
	if (strokeColour) {
		ctx.lineWidth = strokeSize;
		ctx.strokeStyle = strokeColour;
		ctx.stroke();
	}
}

function pointInRect(point, rect) {
	if (rect.x <= point.x && point.x <= rect.x + rect.w) {
		if (rect.y <= point.y && point.y <= rect.y + rect.h) {
			return true;
		}
	}
	return false;
}

function distBetween(pos1, pos2) {
	return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2);
}




class Main {
	constructor() {
		this.keyDown = [];
		this.keyPressed = [];
		this.mousePos = {x:0,y:0};
		this.mouseOffset = {x:0,y:0};
		this.mouseDown = {state:false, x:0, y:0};
		this.mouseClicked = false;	// True for a single update if mouse was clicked

		this.buttons = [
			{
				text: "Mode: Draw",
				font: "20px Verdana",
				rect: {x:900, y:20, h:35, w:190},
				action: function() {
					if (main.mode == "draw") {
						main.mode = "recogniser";
						this.text = "Mode: Recogniser";
					} 
					else if (main.mode == "recogniser") {
						main.mode = "draw";
						this.text = "Mode: Draw";
					}
					//else if (main.mode == "adder") {
					//	main.mode = "draw";
					//	this.text = "Mode: Draw";
					//}
					
					//console.log("Changed mode to " + main.mode);
				}
			}
		];


		this.digitList = [];	// List of digits 


		this.mode = "draw";

		// Draw mode
		this.draw = new Draw();

		// Neural Network for adding 2 numbers
		this.adder = new Adder();

		// Neural network number recogniser
		this.recogniser = new Recogniser();

	}
	init() {


	}
	render() {

		if (this.mode == "draw") this.draw.render();
		else if (this.mode == "adder") this.adder.render();
		else if (this.mode == "recogniser") this.recogniser.render();


		// Render global buttons
		for (var i in this.buttons) {
			if (pointInRect(this.mousePos, this.buttons[i].rect)) {
				ctx.fillStyle = "#777777";
			} else {
				ctx.fillStyle = "#999999";
			}
			ctx.fillRect(this.buttons[i].rect.x, this.buttons[i].rect.y, this.buttons[i].rect.w, this.buttons[i].rect.h);

			if (this.buttons[i].text == this.currentDigit) {
				ctx.strokeStyle = "black";
				ctx.strokeRect(this.buttons[i].rect.x, this.buttons[i].rect.y, this.buttons[i].rect.w, this.buttons[i].rect.h);
			}

			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.font = this.buttons[i].font;
			ctx.fillText(this.buttons[i].text, this.buttons[i].rect.x + this.buttons[i].rect.w/2, this.buttons[i].rect.y+this.buttons[i].rect.h-10);
		}
		
	}
	update() {

		if (this.mode == "draw") this.draw.update();
		else if (this.mode == "adder") this.adder.update();
		else if (this.mode == "recogniser") this.recogniser.update();



		if (this.mouseClicked) {
			// Test for clicks in buttons
			for (var i in this.buttons) {
				if (pointInRect(this.mousePos, this.buttons[i].rect)) {
					this.buttons[i].action();
					this.mouseClicked = false;
					break;
				}
			}
		}

		this.keyPressed = [];
		this.mouseClicked = false;
	}
}


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var textElement = document.getElementById("text");

var main = new Main();
main.init();


// Create tag for uploading files
var uploadElement = document.createElement("input");
uploadElement.type = "file";
uploadElement.style.display = "none";
uploadElement.id = "uploadFile"
uploadElement.onchange = function(e){
	if (uploadElement.files.length == 1) {
		console.log("Uploading file");
		let reader = new FileReader();
		reader.onload = function(e) { 
			var result = JSON.parse(reader.result);
			
			if (main.mode == "draw") {
				main.digitList = result;
			} else if (main.mode == "recogniser") {
				main.recogniser.nn.network = result;
			}

		}
		reader.readAsText(uploadElement.files[0]);
	}
}
document.body.append(uploadElement);


function mainLoop() {		// Updates game on a different clock to rendering
	main.update();
	main.render();
	window.requestAnimationFrame(mainLoop);
}
mainLoop(0);


canvas.addEventListener("mousedown", function(evt) {	// Handle dragging view around simulation
	var canvasRect = canvas.getBoundingClientRect();
	main.mouseDown = {
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	main.mouseDown.state = true;
	//console.log("Mouse down at (" + main.mouseDown.x + ", " + main.mouseDown.y + ")");
});

canvas.addEventListener('mousemove', function(evt) {
	var canvasRect = canvas.getBoundingClientRect();
	main.mousePos = {
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	main.mouseOffset = {
		x: main.mousePos.x - canvas.width/2,
		y: -(main.mousePos.y - canvas.height/2)
	};
}, false);

canvas.addEventListener("click", function(evt) {
	var canvasRect = canvas.getBoundingClientRect();
	main.mousePos = {
		x: evt.clientX - canvasRect.left,
		y: evt.clientY - canvasRect.top
	};
	if (main.mouseDown.state) {
		main.mouseDown.state = false;
	}
	if (main.mousePos.x == main.mouseDown.x && main.mousePos.y == main.mouseDown.y) {	// Mouse did not drag during click, therefore user clicked
		main.mouseClicked = true;
		//console.log("Clicked at (" + main.mousePos.x + ", " + main.mousePos.y + ")");

		// INCLUDE FILE UPLOAD HERE BECAUSE JAVASCRIPT SUCKS
		if ((main.mode == "draw" && pointInRect(main.mousePos, main.draw.uploadButtonRect))
		 || (main.mode == "recogniser" && pointInRect(main.mousePos, main.recogniser.uploadButtonRect))
		) {
			document.getElementById("uploadFile").value = "";
			document.getElementById("uploadFile").click();
			main.mouseClick = false;
		}
	}
});

document.addEventListener("keydown", function(evt) {
	main.keyDown[evt.code] = true;
	if (evt.code == "Space") {
		evt.preventDefault();
	}
	main.keyPressed[evt.code] = true;
});
document.addEventListener("keyup", function(evt) {
	main.keyDown[evt.code] = undefined;
});


canvas.addEventListener('mousewheel', function(evt) {	// Handle zooming
	if (evt.deltaY >= 0) {
		main.renderZoom /= 1.1
	} else {
		main.renderZoom *= 1.1
	}
	//console.log(main.renderZoom)
	//console.log(evt.deltaY>=0 ? "Zooming Out" : "Zooming In");
	evt.preventDefault();
});

