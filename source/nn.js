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


	Training V1

		For every weight, try running the network with that particular weight tweaked up, and then down.
		Find which tweak produced the output with the lowest error and change the network accordingly.
		This will require O(2n) calculations of the network output to training once.


		OR

		Much less calculations are required for this method however it doesn't necessarily perform the optimal tweak each train.
		Tweak each weight, and run the network with that tweak.
		If the tweak get closer to the desired output, make the change and continue looping through each weight.
		Once the final weight has been reached, start over again. 
		If no improvements are found in a whole loop, give up and die.

		Could implement a 'momentum' method for this as well.
		After when an improvement is found with a certain tweak it can be added to a list of good weights to tweak.
		These weight can then be selected to be tweak slightly more than the other weights.


*/


function mapValue(val, oldMin, oldMax, newMin, newMax) {
	return newMin + (newMax-newMin) * (val-oldMin) / (oldMax-oldMin);
}


class Neural_Network {
	constructor(structure) {

		this.MIN_STARTING_WEIGHT = -0.5;
		this.MAX_STARTING_WEIGHT = 0.5;


		this.structure = structure;

		this.network = [];
		for (let layerNum=0; layerNum<this.structure.length; layerNum++) {
			let finalLayer = (layerNum==this.structure.length-1);	// If creating final layer (output layer)
			let layer = [];
			let connectionCount = finalLayer ? 0 : this.structure[layerNum+1];
			for (let neuronNum=0; neuronNum<this.structure[layerNum] + !finalLayer; neuronNum++) {	// NON output layers loop once more to add
				let newNeuron = new Neuron(connectionCount, this.MIN_STARTING_WEIGHT, this.MAX_STARTING_WEIGHT);
				layer.push(newNeuron);

			}
			this.network.push(layer);
		}

		this.TRAINING_TWEAK = 0.01;		// Amount each weight is adjusted by

	}
	getOutput(input) {
		if (input.length != this.structure[0]) return console.log("Invalid Input length");

		input = input.concat(1);

		let output = [];
		for (var layerNum=1; layerNum<this.structure.length; layerNum++) {
			//console.log("Processing layer " + layerNum);

			input = input.concat(1);	// Add input for bias
			for (var neuronNum=0; neuronNum<this.structure[layerNum]; neuronNum++) {
				var neuronOutput = 0;
				for (var weightNum=0; weightNum<this.structure[layerNum-1]+1; weightNum++) {	// +1 for bias
					neuronOutput += input[weightNum] * this.network[layerNum-1][weightNum].weights[neuronNum];
				}
				neuronOutput = Math.tanh(neuronOutput);
				//console.log(neuronOutput)
				output.push(neuronOutput)
			}
			input = output;
			output = [];
		}

		return input;

	}
	train(IOPairs) {	// Trains the network with a list of input-output pairs.

		// Runs the network initially to calculate the sum of each error.
		let currentError = 0;
		for (let i=0; i<IOPairs.length; i++) {
			let actualOutput = this.getOutput(IOPairs[i][0]);
			currentError += this.getError(actualOutput, IOPairs[i][1]);
		}		

		// Now start looping through weights and find one that lowers this error sum
		for (var i=0; i<1; i++) {	// Trains network more than once

			// Pick a random weight in the entire network
			let randomLayer = Math.floor(Math.random()*(this.structure.length-1));
			let randomNeuron = Math.floor(Math.random()*(this.structure[randomLayer]+1));
			let randomWeight = Math.floor(Math.random()*this.structure[randomLayer+1]);
			let randomTweak = mapValue(Math.random(), 0, 1, -this.TRAINING_TWEAK, this.TRAINING_TWEAK);

			// Remember old value
			let oldValue = this.network[randomLayer][randomNeuron].weights[randomWeight];

			// Tweak weight
			this.network[randomLayer][randomNeuron].weights[randomWeight] += randomTweak;

			// Calculate new error sum
			let tweakedError = 0;
			for (let i=0; i<IOPairs.length; i++) {
				let tweakedOutput = this.getOutput(IOPairs[i][0]);
				tweakedError += this.getError(tweakedOutput, IOPairs[i][1]);
			}

			// If error sum is smaller, apply the tweak to the network
			if (tweakedError < currentError) {
				//console.log("Tweak improved! ", tweakedOutput[0]+1);
				currentError = tweakedError;	// Sets new error that is to be aimed for.

			} else {
				// Remove tweak if tweak did not improve network
				this.network[randomLayer][randomNeuron].weights[randomWeight] = oldValue;
			}

		}

		return currentError;
	}
	getError(actual, predicted) {	// Returns the error of an actual output and a predicted output
		let error = 0;
		for (var i=0; i<actual.length; i++) {
			error += (actual[i] - predicted[i])**2;		// Squaring makes it positive and probably does other stuff :)
		}
		return error;

	}
}

class Neuron {
	constructor(connections, minWeight, maxWeight) {		// Number of outgoing connections neuron needs to form

		this.weights = [];
		for (let weightNum=0; weightNum<connections; weightNum++) {
			let weightStrength = mapValue(Math.random(), 0, 1, minWeight, maxWeight);		// Random num from 0-1
			this.weights.push(weightStrength);
		}

	}
}