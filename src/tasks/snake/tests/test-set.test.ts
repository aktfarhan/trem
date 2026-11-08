import { BASIC_GROUPS } from '../observe';
import { DEFAULT_GRID_SIZE } from '../game';
import { scoreSnakeModel } from '../fitness';
import { describe, expect, test } from 'vitest';
import { createSnakeModel, type SnakeModel } from '../model';
import { TEST_SET_SEEDS, TEST_SET_SIZE, testSnakeModel, type TestProgress } from '../test-set';

// Seed shared by every test
const SEED = 42;

// Middle neurons in the tiny model
const TINY_HIDDEN_SIZE = 8;

// Width and height of a grid smaller than default
const SMALL_GRID_SIZE = 10;

// Seed of the first game the research reported on
const RESEARCH_FIRST_SEED = 9_000_000;

// Games played by the report checked partway through
const PARTWAY_GAME_COUNT = 100;

// Make the tiny model with every weight and bias at 0
function makeStraightModel(): SnakeModel {
    const { model } = createSnakeModel(BASIC_GROUPS, TINY_HIDDEN_SIZE, SEED);
    model.network.weights.fill(0);
    return model;
}

// Test the model and keep the reports
function listTestReports(model: SnakeModel, gridSize: number): TestProgress[] {
    const reports: TestProgress[] = [];
    testSnakeModel(model, gridSize, (progress) => reports.push(progress));
    return reports;
}

describe('TEST_SET_SEEDS', () => {
    test('are the games the research reported on', () => {
        // List the research games
        const researchSeeds = Array.from(
            { length: TEST_SET_SIZE },
            (_, i) => RESEARCH_FIRST_SEED + i,
        );

        // Check the test set is exactly those
        expect(TEST_SET_SEEDS).toEqual(researchSeeds);
    });
});

describe('testSnakeModel', () => {
    test('reports after every game', () => {
        // Test the model
        const reports = listTestReports(makeStraightModel(), DEFAULT_GRID_SIZE);

        // Check the games played count up by one to the end
        const gameCounts = reports.map((progress) => progress.gamesPlayed);
        expect(gameCounts).toEqual(Array.from({ length: TEST_SET_SIZE }, (_, i) => i + 1));
    });

    test('ends on the average over the whole test set', () => {
        // Test the model
        const model = makeStraightModel();
        const reports = listTestReports(model, DEFAULT_GRID_SIZE);
        const testScore = scoreSnakeModel(model, TEST_SET_SEEDS);

        // Check the last report matches
        expect(reports.at(-1)?.averageScore).toBe(testScore);
    });

    test('averages the games played so far', () => {
        // Test the model
        const model = makeStraightModel();
        const reports = listTestReports(model, DEFAULT_GRID_SIZE);
        const partwayScore = scoreSnakeModel(model, TEST_SET_SEEDS.slice(0, PARTWAY_GAME_COUNT));

        // Check the report partway through matches
        expect(reports[PARTWAY_GAME_COUNT - 1].averageScore).toBe(partwayScore);
    });

    test('plays on the grid size it is given', () => {
        // Test the model on the small grid
        const model = makeStraightModel();
        const reports = listTestReports(model, SMALL_GRID_SIZE);
        const smallScore = scoreSnakeModel(model, TEST_SET_SEEDS, SMALL_GRID_SIZE);

        // Check the last report matches
        expect(reports.at(-1)?.averageScore).toBe(smallScore);
    });
});
