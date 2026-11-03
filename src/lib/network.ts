import { drawRandom } from './seeded-random';

// Layer sizes, and every number in one list
export interface Network {
    weights: Float64Array;
    layerSizes: number[];
}

// New network, and the random position after making it
export interface CreatedNetwork {
    network: Network;
    randomPosition: number;
}

// Glorot: spread of the random starting weights
const GLOROT_SCALE = 6;

// Numbers one layer needs: a weight per input for each neuron + bias
function countLayerWeights(inputCount: number, neuronCount: number): number {
    return neuronCount * (inputCount + 1);
}

/**
 * Counts the weights and biases a network shape needs.
 *
 * @param layerSizes - Neurons in each layer.
 * @returns Length of the network's weight list.
 */
export function countWeights(layerSizes: number[]): number {
    let count = 0;
    for (let layer = 1; layer < layerSizes.length; layer++) {
        count += countLayerWeights(layerSizes[layer - 1], layerSizes[layer]);
    }
    return count;
}

/**
 * Creates a network with random weights and biases.
 *
 * @param layerSizes - Neurons in each layer.
 * @param randomPosition - Position in the random sequence to draw from.
 * @returns New network, and the next random position.
 */
export function createNetwork(layerSizes: number[], randomPosition: number): CreatedNetwork {
    // Every weight and bias, and where the random sequence is
    const weights = new Float64Array(countWeights(layerSizes));
    let position = randomPosition;
    let weightIndex = 0;

    for (let layer = 1; layer < layerSizes.length; layer++) {
        // Scale the layer's numbers to its size
        const inputCount = layerSizes[layer - 1];
        const neuronCount = layerSizes[layer];
        const limit = Math.sqrt(GLOROT_SCALE / (inputCount + neuronCount));

        // Give each of the layer's numbers a random value
        const layerWeightCount = countLayerWeights(inputCount, neuronCount);
        for (let i = 0; i < layerWeightCount; i++) {
            const draw = drawRandom(position);
            weights[weightIndex] = (draw.value * 2 - 1) * limit;
            position = draw.position;
            weightIndex++;
        }
    }

    return { network: { weights, layerSizes }, randomPosition: position };
}

/**
 * Runs inputs through a network.
 *
 * @param network - Network to run.
 * @param inputs - One number per input neuron.
 * @returns One score per output neuron.
 */
export function runNetwork(network: Network, inputs: number[]): number[] {
    // Refuse inputs the network was not built for
    const inputCount = network.layerSizes[0];
    if (inputs.length !== inputCount)
        throw new Error(`Network expects ${inputCount} inputs, got ${inputs.length}`);

    // Values coming out of the layer before
    const lastLayer = network.layerSizes.length - 1;
    let values = inputs;
    let weightIndex = 0;

    for (let layer = 1; layer <= lastLayer; layer++) {
        const nextValues: number[] = [];
        for (let neuron = 0; neuron < network.layerSizes[layer]; neuron++) {
            // Add up each value times its weight, then the bias
            let sum = 0;
            for (const value of values) {
                sum += value * network.weights[weightIndex];
                weightIndex++;
            }
            sum += network.weights[weightIndex];
            weightIndex++;

            // Squash middle layers to -1 to 1
            nextValues.push(layer === lastLayer ? sum : Math.tanh(sum));
        }
        values = nextValues;
    }

    return values;
}
