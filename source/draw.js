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


class Digit {	// Value is an int from 0-9
	constructor(value) {
		this.value = value;
		this.pixelList = [];
		for (let i=0; i<main.draw.picHeight; i++) {
			for (let j=0; j<main.draw.picWidth; j++) {
				let pixelValue = Math.round(255 * main.draw.picGrid[i][j]);
				this.pixelList.push(pixelValue);
			}
		}
	}
}

class Draw {
	constructor() {

		this.uploadButtonRect = {x:875, y:290, h:35, w:200};

		this.buttons = [
			{
				text: "Clear Image",
				font: "20px Verdana",
				rect: {x:875, y:90, h:35, w:200},
				action: function() {
					main.draw.clearGrid();
				}
			},{
				text: "Download Image",
				font: "20px Verdana",
				rect: {x:875, y:140, h:35, w:200},
				action: function() {
					main.draw.downloadImage();
				} 
			},{
				text: "Save Digit",
				font: "20px Verdana",
				rect: {x:875, y:190, h:35, w:200},
				action: function() {
					main.digitList.push(new Digit(main.draw.currentDigit));
				} 
			},{
				text: "Download Digit List",
				font: "20px Verdana",
				rect: {x:875, y:240, h:35, w:200},
				action: function() {
					main.draw.downloadDigitList();
				} 
			},{
				text: "Upload Digit List",
				font: "20px Verdana",
				rect: this.uploadButtonRect,
				action: function() {}	// Actual function gets run inside of the canvas .click() event because javascript sucks
			},{
				text: "Test Image",
				font: "20px Verdana",
				rect: {x:620, y:90, h:35, w:200},
				action: function() {
					let testDigit = new Digit(main.draw.currentDigit);
					main.draw.testGuesses = main.recogniser.test(testDigit);
				}
			}
		];

		for (let i=0; i<10; i++) {
			this.buttons.push({
				text: i,
				font: "24px Verdana",
				rect: {x:600 + 50*i, y:410, h:40, w:40},
				action: function() {
					main.draw.currentDigit = i;
					main.draw.testGuesses = [];
				} 
			});
		}



		this.picRect = {x:59, y:59, w:512, h:512};
		this.picWidth = 16;
		this.picHeight = 16;
		this.pixelWidth = this.picRect.w / this.picWidth;
		this.pixelHeight = this.picRect.h / this.picHeight;
		this.picGrid = [];
		for (let i=0; i<this.picHeight; i++) {
			let row = [];
			for (let j=0; j<this.picWidth; j++) {
				row.push(1);
			}
			this.picGrid.push(row);
		}


		this.brushSize = 40;

		this.currentDigit = 0;	// Current digit being drawn


		this.testGuesses = [];

	}
	render() {
		fillCanvas("lightgrey");

		drawText("Draw Mode", canvas.width/2, 25, 20, "black", "center");

		// Draw image on left
		drawRect(this.picRect, "black", 3, false);
		for (let i=0; i<this.picWidth; i++) {
			for (let j=0; j<this.picHeight; j++) {
				let pixelRect = {
					x: this.picRect.x + i*this.pixelWidth, 
					y: this.picRect.y + j*this.pixelWidth, 
					w: this.pixelWidth, 
					h: this.pixelHeight
				};
				let pixelColour = Math.round(this.picGrid[j][i] * 255);
				pixelColour = "rgb(" + pixelColour + "," + pixelColour + "," + pixelColour + ")";

				drawRect(pixelRect, false, 0, pixelColour);
			}
		}

		// Render test guesses
		if (this.testGuesses.length == 10) {

			let answer = 0;
			for (let i=0; i<10; i++) {
				if (this.testGuesses[i] > this.testGuesses[answer]) answer = i;
				drawText(i + ": " + ((this.testGuesses[i]+1)*50).toFixed(2) + "%", 600 + Math.floor(i/5)*130, 220+(i%5)*30, 20);		
			}

			//drawText(answer + " - " + ((answer==this.currentDigit) ? "CORRECT" : "WRONG ("+this.currentDigit+")"), 600, 170, 20, (answer==this.currentDigit) ? "green" : "red");
			drawText("Guessed " + answer + " (" + ((this.testGuesses[answer]+1)*50).toFixed(2) + "%)",  600, 170, 20);


		}

		drawText("Saved Digits: " + main.digitList.length, 900, 380, 20);

		// Render individual digit count below
		for (let i=0; i<10; i++) {
			let textPos = {x:620 + 50*i, y:480};
			let digitCount = 0;
			for (let j=0; j<main.digitList.length; j++) {
				if (main.digitList[j].value == i) digitCount++;
			}
			drawText(digitCount, textPos.x, textPos.y, 20, "black", "center");
		}


		// Render pics below
		let picCount = 0;
		for (let i=main.digitList.length; i--;) {
			if (main.digitList[i].value == this.currentDigit) {
				// Render pic
				let smallPicRect = {x:600 + 84*(picCount%6), y:500 + 70*Math.floor(picCount/6), h:64, w:64};
				let pixelSize = smallPicRect.w / this.picWidth;

				drawRect(smallPicRect, "black", 3, false);
				//console.log(main.digitList[i].pixelList.length)
				for (let j=0; j<main.digitList[i].pixelList.length; j++) {
					let pixelRect = {
						x: smallPicRect.x + (j%this.picWidth)*pixelSize, 
						y: smallPicRect.y + Math.floor(j/this.picWidth)*pixelSize, 
						w: pixelSize, 
						h: pixelSize
					};
					let pixelColour = main.digitList[i].pixelList[j];
					pixelColour = "rgb(" + pixelColour + "," + pixelColour + "," + pixelColour + ")";
					drawRect(pixelRect, false, 0, pixelColour);

				}
				
				if (picCount+++1 == 6) break; 
			}
		}



		// Render local buttons
		for (var i in this.buttons) {
			if (pointInRect(main.mousePos, this.buttons[i].rect)) {
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

		if (main.mouseDown.state && pointInRect(main.mousePos, this.picRect)) {
			
			for (let i=0; i<this.picWidth; i++) {
				for (let j=0; j<this.picHeight; j++) {
					
					let pixelRect = {
						x: this.picRect.x + i*this.pixelWidth, 
						y: this.picRect.y + j*this.pixelWidth, 
						w: this.pixelWidth, 
						h: this.pixelHeight
					};

					let pixelCenter = {
						x: pixelRect.x + pixelRect.w/2,
						y: pixelRect.y + pixelRect.h/2
					}

					let mouseDist = distBetween(main.mousePos, pixelCenter);
					if (mouseDist <= this.brushSize) {

						this.picGrid[j][i] = Math.min(
							this.picGrid[j][i],
							(mouseDist/this.brushSize)**3
						);

					}

				}
			}
		}




		if (main.mouseClicked) {
			// Test for clicks in local buttons
			for (var i in this.buttons) {
				if (pointInRect(main.mousePos, this.buttons[i].rect)) {
					this.buttons[i].action();
					main.mouseClicked = false;
					break;
				}
			}
		}

		if (main.keyPressed["KeyC"]) {
			this.clearGrid();
		}
	}
	clearGrid() {
		console.log("Clearing Grid");
		for (let i=0; i<this.picWidth; i++) {
			for (let j=0; j<this.picHeight; j++) {
				this.picGrid[j][i] = 1;
			}
		}
		this.testGuesses = [];	// Remove guess
	}
	downloadImage() {

		let imageCanvas = document.createElement("canvas");
		imageCanvas.width = this.picWidth;
		imageCanvas.height = this.picHeight;
		let imageCtx = imageCanvas.getContext('2d');

		let imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
		for (let j=0; j<this.picHeight; j++) {
			for (let i=0; i<this.picWidth; i++) {
			
				imageData.data[4*(j*this.picWidth+i)] = Math.round(255 * this.picGrid[j][i]);
				imageData.data[4*(j*this.picWidth+i) + 1] = Math.round(255 * this.picGrid[j][i]);
				imageData.data[4*(j*this.picWidth+i) + 2] = Math.round(255 * this.picGrid[j][i]);
				imageData.data[4*(j*this.picWidth+i) + 3] = 255;

			}
		}

		document.body.append(imageCanvas);
	    imageCtx.putImageData(imageData, 0, 0);
		let dataURL = imageCanvas.toDataURL("image/png");
		//imageCanvas.remove();
		let downloadLink = document.createElement("a");
		downloadLink.href = dataURL;
		downloadLink.download = "digit - " + this.currentDigit + ".png";
		document.body.append(downloadLink);
		downloadLink.click();
		downloadLink.remove();

	}
	downloadDigitList() {
		
		let textFileString = JSON.stringify(main.digitList);
		//console.log(textFileString)
		let textFile = new Blob([textFileString], {type:"text/plain"});
		let downloadLink = document.createElement("a");
		downloadLink.href = URL.createObjectURL(textFile);
		downloadLink.download = "digits.txt";
		document.body.append(downloadLink);
		downloadLink.click();
		downloadLink.remove();
	}
}
