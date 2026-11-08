import { BASIC_GROUPS } from '../observe';
import { createSnakeModel } from '../model';
import { scoreSnakeModel } from '../fitness';
import { describe, expect, test } from 'vitest';
import {
    createTraining,
    KEEP_CHECK_GAP,
    trainGeneration,
    type KeptSnake,
    type RunSeeds,
    type SnakeTraining,
    type TrainedGeneration,
    type TrainingSettings,
} from '../train';
import type { Network } from '../../../lib/network';

// Seeds shared by every training test
const SEEDS: RunSeeds = { worldSeed: 3, trainingSeed: 22 };

// Seed for a second
const OTHER_SEED = 99;

// Tiny training of 4 snakes on a small grid, with 2 games each
const SMALL_SETTINGS: TrainingSettings = {
    groups: BASIC_GROUPS,
    gridSize: 10,
    keepCount: 2,
    hiddenSize: 4,
    snakeCount: 4,
    mutationRate: 0.5,
    mutationSize: 1,
    gamesPerSnake: 2,
};

// Games a kept snake has played after two generations
const TWO_GENERATIONS_OF_GAMES = 4;

// Past record of a snake that averaged 10 apples over 100 games
const STRONG_PAST_RECORD = { games: 100, total: 1000 };

// Validation score that no snake can beat
const UNBEATABLE_SCORE = Number.POSITIVE_INFINITY;

// Validation score that every snake beats
const BEATEN_SCORE = -1;

// Start the small training from the shared seeds
function startSmallTraining(): SnakeTraining {
    return createTraining(SMALL_SETTINGS, SEEDS);
}

// Train two generations of the small training
function trainTwoGenerations(): TrainedGeneration {
    const first = trainGeneration(startSmallTraining());
    return trainGeneration(first.training);
}

// Make a kept snake
function makeKeptSnake(validationScore: number): KeptSnake {
    const { model } = createSnakeModel(BASIC_GROUPS, SMALL_SETTINGS.hiddenSize, OTHER_SEED);
    return { model, generation: 0, validationScore };
}

// Make a training one generation before a check
function makeTrainingBeforeCheck(kept: KeptSnake | null): SnakeTraining {
    return { ...startSmallTraining(), kept, generation: KEEP_CHECK_GAP - 1 };
}

// List each snake's score over every game it has played
function listRecordScores(training: SnakeTraining): number[] {
    return Array.from(training.recordByNetwork.values(), (record) => record.total / record.games);
}

// Find the snake with the best score over all its games
function findBestNetwork(training: SnakeTraining): Network {
    const networks = [...training.recordByNetwork.keys()];
    const scores = listRecordScores(training);
    return networks[scores.indexOf(Math.max(...scores))];
}

// Average some scores
function averageScores(scores: number[]): number {
    let total = 0;
    for (const score of scores) {
        total += score;
    }
    return total / scores.length;
}

describe('createTraining', () => {
    test('makes the snakes asked for, with nothing kept yet', () => {
        // Start a training
        const training = startSmallTraining();

        // Check its snakes, generation and kept snake
        expect(training.networks).toHaveLength(SMALL_SETTINGS.snakeCount);
        expect(training.generation).toBe(0);
        expect(training.kept).toBeNull();
    });

    test('same seeds give the same training', () => {
        expect(startSmallTraining()).toEqual(startSmallTraining());
    });

    test('the training seed decides the starting snakes', () => {
        // Start a second training from another training seed
        const first = startSmallTraining();
        const second = createTraining(SMALL_SETTINGS, { ...SEEDS, trainingSeed: OTHER_SEED });

        // Compare their first snakes
        expect(second.networks[0].weights).not.toEqual(first.networks[0].weights);
    });

    test('the world seed leaves the starting snakes alone', () => {
        // Start a second training in another world
        const first = startSmallTraining();
        const second = createTraining(SMALL_SETTINGS, { ...SEEDS, worldSeed: OTHER_SEED });

        // Check both trainings start with the same snakes
        expect(second.networks).toEqual(first.networks);
    });

    test('the world seed decides the validation set', () => {
        // Start trainings with another training seed
        const first = startSmallTraining();
        const otherSnakes = createTraining(SMALL_SETTINGS, { ...SEEDS, trainingSeed: OTHER_SEED });
        const otherWorld = createTraining(SMALL_SETTINGS, { ...SEEDS, worldSeed: OTHER_SEED });

        // Check only the other world has another validation set
        expect(otherSnakes.validationSeeds).toEqual(first.validationSeeds);
        expect(otherWorld.validationSeeds).not.toEqual(first.validationSeeds);
    });

    test('draws the training games after the validation set', () => {
        // Start a training
        const training = startSmallTraining();

        // Check the world moved on past its validation set
        expect(training.worldPosition).not.toBe(SEEDS.worldSeed);
    });
});

describe('trainGeneration', () => {
    test('moves the training on one generation', () => {
        // Train one generation
        const { training } = trainGeneration(startSmallTraining());

        // Check the count moved on and no snakes were lost
        expect(training.generation).toBe(1);
        expect(training.networks).toHaveLength(SMALL_SETTINGS.snakeCount);
    });

    test('never changes the training it started from', () => {
        // Train one generation
        const training = startSmallTraining();
        trainGeneration(training);

        // Check the starting training still matches a fresh one
        expect(training).toEqual(startSmallTraining());
    });

    test('same seeds give the same training', () => {
        expect(trainTwoGenerations()).toEqual(trainTwoGenerations());
    });

    test('plays new games each generation', () => {
        // Play the same snakes on the world's first games, then ones after
        const training = startSmallTraining();
        const first = trainGeneration(training);
        const { worldPosition } = first.training;
        const second = trainGeneration({ ...training, worldPosition });

        // Check the games gave different scores
        expect(second.averageScore).not.toBe(first.averageScore);
    });

    test('the world seed decides the games', () => {
        // Play the same snakes in two worlds
        const first = trainGeneration(startSmallTraining());
        const otherWorld = createTraining(SMALL_SETTINGS, { ...SEEDS, worldSeed: OTHER_SEED });
        const second = trainGeneration(otherWorld);

        // Check the games gave different scores
        expect(second.averageScore).not.toBe(first.averageScore);
    });

    test('the training seed leaves the games alone', () => {
        // Train one generation from another training seed
        const first = trainGeneration(startSmallTraining());
        const otherSnakes = createTraining(SMALL_SETTINGS, { ...SEEDS, trainingSeed: OTHER_SEED });
        const second = trainGeneration(otherSnakes);

        // Check the world moved on to the same place
        expect(second.training.worldPosition).toBe(first.training.worldPosition);
    });

    test('keeps the same validation set for the whole training', () => {
        // Train two generations
        const { training } = trainTwoGenerations();

        // Check the validation set is still the one the training started with
        expect(training.validationSeeds).toEqual(startSmallTraining().validationSeeds);
    });

    test('judges a kept snake on every game it has played', () => {
        // Train two generations
        const first = trainGeneration(startSmallTraining());
        const second = trainGeneration(first.training);

        // Find the records of a kept snake and a new copy
        const { networks } = first.training;
        const keptRecord = second.training.recordByNetwork.get(networks[0]);
        const copyRecord = second.training.recordByNetwork.get(networks[SMALL_SETTINGS.keepCount]);

        // Check the kept snake counts both generations
        expect(keptRecord?.games).toBe(TWO_GENERATIONS_OF_GAMES);
        expect(copyRecord?.games).toBe(SMALL_SETTINGS.gamesPerSnake);
    });

    test('ranks snakes by their score over every game they played', () => {
        // Give the last snake a strong past, then train one generation
        const start = startSmallTraining();
        const lastNetwork = start.networks[SMALL_SETTINGS.snakeCount - 1];
        const recordByNetwork = new Map([[lastNetwork, STRONG_PAST_RECORD]]);
        const { training } = trainGeneration({ ...start, recordByNetwork });

        // Check its past carried it to the front of the next generation
        expect(training.networks[0]).toBe(lastNetwork);
    });

    test('reports the best and average score over every game each snake played', () => {
        // Train two generations, so kept snakes have played both
        const { training, bestScore, averageScore } = trainTwoGenerations();

        // Check the report matches the records
        const scores = listRecordScores(training);
        expect(bestScore).toBe(Math.max(...scores));
        expect(averageScore).toBe(averageScores(scores));
    });

    test('checks for a better snake only every few generations', () => {
        // Train one generation from the start
        const training = { ...startSmallTraining(), kept: makeKeptSnake(BEATEN_SCORE) };
        const result = trainGeneration(training);

        // Check the kept snake stays
        expect(result.training.kept).toBe(training.kept);
    });

    test('keeps the best snake at the first check', () => {
        // Train the generation that ends with a check
        const { training } = trainGeneration(makeTrainingBeforeCheck(null));

        // Check the generation's best snake is kept
        expect(training.kept?.model.network).toBe(findBestNetwork(training));
        expect(training.kept?.model.groups).toEqual(SMALL_SETTINGS.groups);
        expect(training.kept?.generation).toBe(KEEP_CHECK_GAP);
    });

    test("judges the best snake on the world's validation set", () => {
        // Train the generation that ends with a check
        const { training } = trainGeneration(makeTrainingBeforeCheck(null));

        // Score the best snake on the training's validation set
        const model = { groups: SMALL_SETTINGS.groups, network: findBestNetwork(training) };
        const validationScore = scoreSnakeModel(
            model,
            training.validationSeeds,
            SMALL_SETTINGS.gridSize,
        );

        // Check the kept snake got that score
        expect(training.kept?.validationScore).toBe(validationScore);
    });

    test('keeps the old snake when the best does no better', () => {
        // Train the generation that ends with a check
        const kept = makeKeptSnake(UNBEATABLE_SCORE);
        const { training } = trainGeneration(makeTrainingBeforeCheck(kept));

        // Check the old snake stays
        expect(training.kept).toBe(kept);
    });

    test('replaces the kept snake when the best does better', () => {
        // Train the generation that ends with a check
        const kept = makeKeptSnake(BEATEN_SCORE);
        const { training } = trainGeneration(makeTrainingBeforeCheck(kept));

        // Check the generation's best snake took its place
        expect(training.kept?.model.network).toBe(findBestNetwork(training));
        expect(training.kept?.validationScore).toBeGreaterThan(BEATEN_SCORE);
    });
});
