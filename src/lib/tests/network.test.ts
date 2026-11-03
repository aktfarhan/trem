import { describe, expect, test } from 'vitest';
import { countWeights, createNetwork, runNetwork, type Network } from '../network';

// Seed shared by every test
const SEED = 42;

// Signals the snake starts with
const SIGNAL_COUNT = 11;

// Middle neurons in the network
const HIDDEN_COUNT = 8;

// Scores per move
const SCORE_COUNT = 3;

// Snake's network from signals to scores
const TINY_LAYER_SIZES = [SIGNAL_COUNT, HIDDEN_COUNT, SCORE_COUNT];

// Numbers in the network
const TINY_WEIGHT_COUNT = 123;

// Network to work out by hand
const HAND_NETWORK: Network = {
    weights: new Float64Array([1, -1, 0.5, 0.5, 0.5, 0, 2, -1, 0.25]),
    layerSizes: [2, 2, 1],
};

// Network with two middle layers of one neuron each
const DEEP_NETWORK: Network = {
    weights: new Float64Array([2, 0, 3, 0, 4, 0.5]),
    layerSizes: [1, 1, 1, 1],
};

// Input for the deep network
const DEEP_INPUTS = [1];

// Score by hand
const DEEP_SCORE = 4 * Math.tanh(3 * Math.tanh(2)) + 0.5;

// Inputs for the hand network
const HAND_INPUTS = [1, 0];

// Score by hand
const HAND_SCORE = 2 * Math.tanh(1.5) - Math.tanh(0.5) + 0.25;

// Glorot limit for each first layer
const FIRST_LAYER_LIMIT = Math.sqrt(6 / (SIGNAL_COUNT + HIDDEN_COUNT));

describe('countWeights', () => {
    test('counts a weight per input and a bias for each neuron', () => {
        expect(countWeights(TINY_LAYER_SIZES)).toBe(TINY_WEIGHT_COUNT);
    });
});

describe('createNetwork', () => {
    test('makes one number per weight and bias', () => {
        // Create the network
        const { network } = createNetwork(TINY_LAYER_SIZES, SEED);

        // Check its size and shape
        expect(network.weights).toHaveLength(TINY_WEIGHT_COUNT);
        expect(network.layerSizes).toEqual(TINY_LAYER_SIZES);
    });

    test('same seed gives the same network', () => {
        // Create two networks from the same seed
        const first = createNetwork(TINY_LAYER_SIZES, SEED);
        const second = createNetwork(TINY_LAYER_SIZES, SEED);

        // Compare
        expect(second).toEqual(first);
    });

    test('the next position gives a different network', () => {
        // Create a network, then another from where the first left off
        const first = createNetwork(TINY_LAYER_SIZES, SEED);
        const second = createNetwork(TINY_LAYER_SIZES, first.randomPosition);

        // Compare
        expect(second.network.weights).not.toEqual(first.network.weights);
    });

    test('starting numbers stay within the first layer limit', () => {
        // Create the network and take its first layer
        const { network } = createNetwork(TINY_LAYER_SIZES, SEED);
        const firstLayerCount = countWeights([SIGNAL_COUNT, HIDDEN_COUNT]);
        const firstLayer = network.weights.slice(0, firstLayerCount);

        // Check each number is in the range
        for (const weight of firstLayer) {
            expect(Math.abs(weight)).toBeLessThanOrEqual(FIRST_LAYER_LIMIT);
        }
    });
});

describe('runNetwork', () => {
    test('gives the score worked out by hand', () => {
        // Run the hand network
        const scores = runNetwork(HAND_NETWORK, HAND_INPUTS);

        // Compare with the hand score
        expect(scores).toHaveLength(1);
        expect(scores[0]).toBeCloseTo(HAND_SCORE);
    });

    test('runs a network with two middle layers', () => {
        // Run the deep network
        const scores = runNetwork(DEEP_NETWORK, DEEP_INPUTS);

        // Compare with the hand score
        expect(scores[0]).toBeCloseTo(DEEP_SCORE);
    });

    test('gives one score per output neuron', () => {
        // Run the network on all signals off
        const { network } = createNetwork(TINY_LAYER_SIZES, SEED);
        const scores = runNetwork(network, new Array(SIGNAL_COUNT).fill(0));

        // Check there is a score per move
        expect(scores).toHaveLength(SCORE_COUNT);
    });

    test('refuses the wrong number of inputs', () => {
        // Create the network
        const { network } = createNetwork(TINY_LAYER_SIZES, SEED);

        // Check it throws on two inputs instead of eleven
        expect(() => runNetwork(network, HAND_INPUTS)).toThrow('Network expects 11 inputs, got 2');
    });
});
