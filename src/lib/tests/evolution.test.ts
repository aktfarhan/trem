import { describe, expect, test } from 'vitest';
import { averageWithPastScores, evolvePopulation, type EvolutionSettings } from '../evolution';
import type { Network } from '../network';

// Seed shared by every evolution test
const SEED = 42;

// Small network shape: 2 inputs, 1 score
const SMALL_LAYER_SIZES = [2, 1];

// Numbers in the small network
const SMALL_WEIGHT_COUNT = 3;

// Largest change one nudge makes
const MUTATION_SIZE = 2;

// Keep 2 and nudge every weight
const NUDGE_ALL: EvolutionSettings = {
    keepCount: 2,
    mutationRate: 1,
    mutationSize: MUTATION_SIZE,
};

// Keep 2 and nudge nothing
const NUDGE_NONE: EvolutionSettings = {
    keepCount: 2,
    mutationRate: 0,
    mutationSize: MUTATION_SIZE,
};

// One score per network in the population
const SCORES = [1, 5, 3, 2];

// Every network scoring the same
const TIED_SCORES = [0, 0, 0, 0];

// One score short of the population
const TOO_FEW_SCORES = [1, 5, 3];

// Weight of a network outside the population
const OUTSIDE_WEIGHT = 5;

// Games behind each new score
const GAME_COUNT = 3;

// New score of every network this generation
const NEW_SCORE = 4;

// Games a kept network played before
const PAST_GAMES = 6;

// Kept network's score added up over its past games
const PAST_TOTAL = 60;

// Kept network's average over all 9 games
const COMBINED_AVERAGE = 8;

// Make a small network with every number the same
function makeNetwork(weight: number): Network {
    return {
        weights: new Float64Array(SMALL_WEIGHT_COUNT).fill(weight),
        layerSizes: SMALL_LAYER_SIZES,
    };
}

// Make a population of four small networks
function makePopulation(): Network[] {
    return [makeNetwork(1), makeNetwork(2), makeNetwork(3), makeNetwork(4)];
}

// Make past records holding one network's earlier games
function makePastRecords(network: Network) {
    return new Map([[network, { games: PAST_GAMES, total: PAST_TOTAL }]]);
}

describe('evolvePopulation', () => {
    test('keeps the best networks first', () => {
        // Evolve the population
        const population = makePopulation();
        const { networks } = evolvePopulation(population, SCORES, NUDGE_ALL, SEED);

        // Check the best two lead the next generation
        expect(networks).toHaveLength(population.length);
        expect(networks[0]).toBe(population[1]);
        expect(networks[1]).toBe(population[2]);
    });

    test('fills the rest with copies of the kept ones', () => {
        // Evolve without nudging
        const population = makePopulation();
        const { networks } = evolvePopulation(population, SCORES, NUDGE_NONE, SEED);

        // Check each child matches its parent but has its own weights
        expect(networks[2].weights).toEqual(population[1].weights);
        expect(networks[3].weights).toEqual(population[2].weights);
        expect(networks[2].weights).not.toBe(population[1].weights);
    });

    test('nudges each weight by at most the mutation size', () => {
        // Evolve with every weight nudged
        const population = makePopulation();
        const { networks } = evolvePopulation(population, SCORES, NUDGE_ALL, SEED);

        // Measure how far the first child moved from its parent
        const parentWeights = population[1].weights;
        const nudges = Array.from(networks[2].weights, (weight, i) => weight - parentWeights[i]);

        // Check every weight moved in the range
        for (const nudge of nudges) {
            expect(nudge).not.toBe(0);
            expect(Math.abs(nudge)).toBeLessThanOrEqual(MUTATION_SIZE);
        }
    });

    test('never changes the parents', () => {
        // Evolve with every weight nudged
        const population = makePopulation();
        evolvePopulation(population, SCORES, NUDGE_ALL, SEED);

        // Check the parents still have their own numbers
        expect(population[1]).toEqual(makeNetwork(2));
        expect(population[2]).toEqual(makeNetwork(3));
    });

    test('same position gives the same next generation', () => {
        // Evolve the same population twice from the same position
        const population = makePopulation();
        const first = evolvePopulation(population, SCORES, NUDGE_ALL, SEED);
        const second = evolvePopulation(population, SCORES, NUDGE_ALL, SEED);

        // Compare
        expect(second).toEqual(first);
    });

    test('keeps the earlier network on a tie', () => {
        // Evolve with every score the same
        const population = makePopulation();
        const { networks } = evolvePopulation(population, TIED_SCORES, NUDGE_ALL, SEED);

        // Check the first two stay in front
        expect(networks[0]).toBe(population[0]);
        expect(networks[1]).toBe(population[1]);
    });

    test('refuses scores that do not match the networks', () => {
        expect(() => evolvePopulation(makePopulation(), TOO_FEW_SCORES, NUDGE_ALL, SEED)).toThrow(
            'Evolution needs 4 scores, got 3',
        );
    });

    test('refuses to keep none, or more networks than there are', () => {
        // Evolve keeping too few and too many
        const population = makePopulation();
        const keepNone = { ...NUDGE_ALL, keepCount: 0 };
        const keepTooMany = { ...NUDGE_ALL, keepCount: population.length + 1 };

        // Check both are refused
        expect(() => evolvePopulation(population, SCORES, keepNone, SEED)).toThrow(
            'Evolution keeps 1 to 4 networks, got 0',
        );
        expect(() => evolvePopulation(population, SCORES, keepTooMany, SEED)).toThrow(
            'Evolution keeps 1 to 4 networks, got 5',
        );
    });
});

describe('averageWithPastScores', () => {
    test('averages a kept network over every game it played before', () => {
        // Give the first network a past, then the same new score to every network
        const population = makePopulation();
        const recordByNetwork = makePastRecords(population[0]);
        const newScores = population.map(() => NEW_SCORE);
        const averaged = averageWithPastScores(population, newScores, GAME_COUNT, recordByNetwork);

        // Check only the first network's score includes its past games
        expect(averaged.scores).toEqual([COMBINED_AVERAGE, NEW_SCORE, NEW_SCORE, NEW_SCORE]);
    });

    test('starts a record for each network with no past', () => {
        // Average with no past records
        const population = makePopulation();
        const newScores = population.map(() => NEW_SCORE);
        const averaged = averageWithPastScores(population, newScores, GAME_COUNT, new Map());

        // Check each network now has a record of just this generation's games
        const newRecord = { games: GAME_COUNT, total: NEW_SCORE * GAME_COUNT };
        for (const network of population) {
            expect(averaged.recordByNetwork.get(network)).toEqual(newRecord);
        }
    });

    test('keeps records only for this generation', () => {
        // Average with a record for a network that is no longer in the population
        const population = makePopulation();
        const outsideNetwork = makeNetwork(OUTSIDE_WEIGHT);
        const newScores = population.map(() => NEW_SCORE);
        const recordByNetwork = makePastRecords(outsideNetwork);
        const averaged = averageWithPastScores(population, newScores, GAME_COUNT, recordByNetwork);

        // Check the outside network is dropped and every current one has a record
        expect(averaged.recordByNetwork.has(outsideNetwork)).toBe(false);
        expect(averaged.recordByNetwork.size).toBe(population.length);
    });

    test('never changes the past records', () => {
        // Average a kept network with its past record
        const population = makePopulation();
        const recordByNetwork = makePastRecords(population[0]);
        const newScores = population.map(() => NEW_SCORE);
        averageWithPastScores(population, newScores, GAME_COUNT, recordByNetwork);

        // Check the past records still hold only the old games
        expect(recordByNetwork).toEqual(makePastRecords(population[0]));
    });

    test('refuses scores that do not match the networks', () => {
        expect(() =>
            averageWithPastScores(makePopulation(), TOO_FEW_SCORES, GAME_COUNT, new Map()),
        ).toThrow('Averaging needs 4 scores, got 3');
    });
});
