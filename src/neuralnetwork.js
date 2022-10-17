class NeuralNetwork {
    constructor(neuronCounts) {
        this.layers = [];

        this.pBest = { fitness: 0, network: undefined};
        this.gBest = { fitness: 0, network: undefined};

        this.inertiaWeight = 0.9;
        this.cognitveWeight = 0.5;
        this.socialWeight = 1.5;

        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.layers.push(new Layer(neuronCounts[i], neuronCounts[i + 1]));
        }
    }
    static feedForward(inputVals, network) {
        let outputs = Layer.feedForward(inputVals, network.layers[0]);

        for (let i = 1; i < network.layers.length; i++) {
            outputs = Layer.feedForward(outputs, network.layers[i]);
        }

        return outputs;
    }

    static scoreUpdate(pNetwork, oNetwork, score) {
        if (score > pNetwork.pBest.fitness) {
            pNetwork.pBest.fitness = score;
            pNetwork.pBest.network = oNetwork;
        }

        if (score > pNetwork.gBest.fitness) {
            pNetwork.gBest.fitness = score;
            pNetwork.gBest.network = oNetwork;
        }
        print({ pBest: pNetwork.pBest, gBest: pNetwork.gBest });
    }

    static velocityUpdate(network) {
        for(let x = 0; x < network.layers.length; x++) {
            for (let i = 0; i < network.layers[x].velocity.length; i++) {
                for (let j = 0; j < network.layers[x].velocity[i].length; j++) {
                    network.layers[x].velocity[i][j] = (network.layers[x].velocity[i][j] * network.inertiaWeight) + (network.cognitveWeight*Math.random()*(network.pBest.network.layers[x].weights[i][j] - network.layers[x].weights[i][j])) + (network.socialWeight*Math.random()*(network.gBest.network.layers[x].weights[i][j]- network.layers[x].weights[i][j]));
                }
            }

            for (let i = 0; i < network.layers[x].weights.length; i++) {
                for (let j = 0; j < network.layers[x].weights[i].length; j++) {
                    if (Math.random() < mutationRate) {
                        network.layers[x].weights[i][j] = network.layers[x].weights[i][j] + network.layers[x].velocity[i][j];
                    }
                }
            }
        }
    }
}

class Layer {
    constructor(inputSize, outputSize) {
        this.inputs = new Array(inputSize);
        this.outputs = new Array(outputSize);
        this.biases = new Array(outputSize);

        this.weights = [];
        this.velocity = [];

        for (let i = 0; i < inputSize; i++) {
            this.velocity[i] = new Array(outputSize);
        }

        for (let i = 0; i < inputSize; i++) {
            for (let j = 0; j < outputSize; j++) {
                this.velocity[i][j] = 0;
            }
        }

        for (let x = 0; x < inputSize; x++) {
            this.weights[x] = new Array(outputSize);
        }

        Layer.randomise(this);
    }

    static randomise(layer) {
        for (let x = 0; x < layer.inputs.length; x++) {
            for (let y = 0; y < layer.outputs.length; y++) {
                layer.weights[x][y] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < layer.biases.length; i++) {
            layer.biases[i] = 0;
        }
    }

    static feedForward(inputVals, layer) {
        for (let i = 0; i < layer.inputs.length; i++) {
            layer.inputs[i] = inputVals[i];
        }

        for (let i = 0; i < layer.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < layer.inputs.length; j++) {
                sum += layer.inputs[j] * layer.weights[j][i];
            }

            layer.outputs[i] = Math.tanh(sum + layer.biases[i]);
        }

        return layer.outputs;
    }
}