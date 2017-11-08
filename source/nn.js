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

		this.LEARNING_RATE = 0.1;

	}
	getOutput(input) {
		if (input.length != this.structure[0]) return console.log("Invalid Input length");

		let neuronOutputs = Array(this.structure.length);
		neuronOutputs[0] = input;
		for (var layerNum=1; layerNum<this.structure.length; layerNum++) {
			//console.log("Processing layer " + layerNum);

			neuronOutputs[layerNum-1] = neuronOutputs[layerNum-1].concat(1);	// Add bias neurons input to this layer
			neuronOutputs[layerNum] = [];
			for (var neuronNum=0; neuronNum<this.structure[layerNum]; neuronNum++) {
				var neuronOutput = 0;
				for (var weightNum=0; weightNum<this.structure[layerNum-1]+1; weightNum++) {	// +1 for bias
					neuronOutput += neuronOutputs[layerNum-1][weightNum] * this.network[layerNum-1][weightNum].weights[neuronNum];
				}
				neuronOutput = Math.tanh(neuronOutput);
				//console.log(neuronOutput)
				neuronOutputs[layerNum].push(neuronOutput)
			}
		}

		return neuronOutputs;

	}
	train(IOPairs) {	// Trains the network with a list of input-output pairs.

		// Loop through each IOPair and find the desired weight changes for each input
		// After each IOPair has been looped, apply the average weight change from each IOPair to each weight

		//console.log("Training with ", IOPairs)

		let startingError = 0;

		// Create array to store weight slopes
		let dEdW = Array(this.structure.length-1);
		for (var l=0; l<this.structure.length-1; l++) {
			let layerNeurons = Array(this.structure[l]+1);	// Neurons in current layer (+1 for bias)
			for (var n=0; n<this.structure[l]+1; n++) {
				let neuronWeights = Array(this.structure[l+1]);	// Weights coming from each neuron (# neurons in next layer)
				for (var m=0; m<this.structure[l+1]; m++) {
					neuronWeights[m] = 0;
				}
				layerNeurons[n] = neuronWeights;
			}
			dEdW[l] = layerNeurons;
		}

		for (let i=IOPairs.length; i--;) {

			let neuronOutputs = this.getOutput(IOPairs[i][0]);

			let input = neuronOutputs[0];
			let output = neuronOutputs[neuronOutputs.length-1];
			let desired = IOPairs[i][1];

			//console.log("IOPair: ", IOPairs[i])
			//console.log("Output: ", neuronOutputs);

			// Add error to starting error
			for (let j=output.length; j--;) {
				startingError += (output[j] - desired[j])**2;
			}


			// Find the derivative of the error with respect to an individual weight 
			/*

				Need to store the output of each neuron in the network after it has run once.
				This include inputs/outputs, plus any hidden neuron outputs (outputs are the activated sums of a neuron).
		
				The desired outputs are also needed to calculate the weight change.

			*/

			// Contains derivatives of the overall error with respect to each individual neuron output.
			// Derivatives are held in layers starting with the final layer
			let dEdO = [];
			for (var l=neuronOutputs.length-1; l>0; l--) {
				let layerDerivatives = Array(this.structure[l]);

				// Find derivative for each neuron in this layer
				for (var n=0; n<this.structure[l]; n++) {
					if (l==neuronOutputs.length-1) {	
						// If working with output layer, derivative is calculated directly
						let derivative = 2 * (output[n] - desired[n]);
						layerDerivatives[n] = derivative;

					} else {	
						// If working with hidden layer, derivative is calculated in terms of derivatives of next layer
						// dEdO = sum of next layer neurons: 
						// 	dE/dO(n) * dO(n)/dS(n) * dS(n)/dO
						//  dE/dO(n) * (1 - O(n)^2) * w(n)
						let derivative = 0;
						for (var m=0; m<dEdO[dEdO.length-1].length; m++) {	// Requires the derivatives of previously calculated layer
							derivative += dEdO[dEdO.length-1][m] * (1 - neuronOutputs[l+1][m]**2) * this.network[l][n].weights[m];
						}
						layerDerivatives[n] = derivative;
					}
				}

				//console.log("dEdO for layer " + l, layerDerivatives);
				dEdO.push(layerDerivatives);
			}
			//console.log("dEdO for network: ", dEdO)

			// Calculate and add weight slopes to dEdW array which holds them
			for (var l=0; l<this.structure.length-1; l++) {
				for (var n=0; n<this.structure[l]+1; n++) {
					for (var m=0; m<this.structure[l+1]; m++) {
						dEdW[l][n][m] += neuronOutputs[l][n] * (1 - neuronOutputs[l+1][m]**2) * dEdO[dEdO.length-l-1][m];
					}
				}
			}
			//console.log("dEdW for network: ", dEdW);

		}


		// Now apply changes to weights
		for (var l=0; l<dEdW.length; l++) {
			for (var n=0; n<dEdW[l].length; n++) {
				for (var m=0; m<dEdW[l][n].length; m++) {
					this.network[l][n].weights[m] += dEdW[l][n][m] / IOPairs.length * -1 * this.LEARNING_RATE;
				}
			}
		}



		//console.log("Starting Error: ", startingError);

		// Calculate new error
		let newError = 0;
		for (let i=IOPairs.length; i--;) {
			// Add error to starting error
			let newOutput = this.getOutput(IOPairs[i][0]);
			newOutput = newOutput[newOutput.length-1];
			for (let j=newOutput.length; j--;) {
				newError += (newOutput[j] - IOPairs[i][1][j])**2;
			}
		}
		//console.log("New Error: ", newError)

		return newError;

	}
	getError(actual, predicted) {	// Returns the error of an actual output and a predicted output
		let error = 0;
		for (var i=0; i<actual.length; i++) {
			error += (actual[i] - predicted[i])**2;		// Squaring makes it positive and probably does other stuff :)
		}
		return error;

	}
	test(IOPair) {
		let output = this.getOutput(IOPair[0]);
		output = output[output.length-1];
		console.log("Output: ", output);

		// Calculate error
		let error = 0;
		for (let j=output.length; j--;) {
			error += (output[j] - IOPair[1][j])**2;
		}
		console.log("Error: ", error);
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