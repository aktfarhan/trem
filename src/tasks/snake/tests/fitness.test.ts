import { BASIC_GROUPS } from '../observe';
import { describe, expect, test } from 'vitest';
import { playModelGame, scoreSnakeModel } from '../fitness';
import { createSnakeModel, type SnakeModel } from '../model';

// Seed shared by every test
const SEED = 42;

// Seed with the first apple in front of the head
const APPLE_AHEAD_SEED = 6;

// Width and height of a grid smaller than default
const SMALL_GRID_SIZE = 10;

// Seed with the first apple in front of the head on smaller grid
const SMALL_GRID_SEED = 13;

// Middle neurons in the tiny model
const TINY_HIDDEN_SIZE = 8;

// Average for one game with an apple and one without
const HALF_AN_APPLE = 0.5;

// Make the tiny model with every weight and bias at 0
function makeStraightModel(): SnakeModel {
    const { model } = createSnakeModel(BASIC_GROUPS, TINY_HIDDEN_SIZE, SEED);
    model.network.weights.fill(0);
    return model;
}

describe('playModelGame', () => {
    test('plays until the game ends', () => {
        // Go straight from the start
        const state = playModelGame(makeStraightModel(), SEED);

        // Check it ran into the wall
        expect(state.endReason).toBe('wall');
    });

    test('eats the apple on the way', () => {
        // Go straight with the apple ahead
        const state = playModelGame(makeStraightModel(), APPLE_AHEAD_SEED);

        // Check it ate it before the wall
        expect(state.score).toBe(1);
    });

    test('same model and seed give the same game', () => {
        // Play the same game twice with a random model
        const { model } = createSnakeModel(BASIC_GROUPS, TINY_HIDDEN_SIZE, SEED);
        const first = playModelGame(model, SEED);
        const second = playModelGame(model, SEED);

        // Compare
        expect(second).toEqual(first);
    });

    test('plays on the grid size it is given', () => {
        // Go straight on the small grid
        const state = playModelGame(makeStraightModel(), SEED, SMALL_GRID_SIZE);

        // Check the game used it
        expect(state.gridSize).toBe(SMALL_GRID_SIZE);
    });
});

describe('scoreSnakeModel', () => {
    test('averages the apples across the games', () => {
        // Score one game without an apple on the way and one with
        const score = scoreSnakeModel(makeStraightModel(), [SEED, APPLE_AHEAD_SEED]);

        // Check it is half an apple per game
        expect(score).toBe(HALF_AN_APPLE);
    });

    test('scores on the grid size it is given', () => {
        // Score the same game on the small grid and on the default
        const straightModel = makeStraightModel();
        const smallScore = scoreSnakeModel(straightModel, [SMALL_GRID_SEED], SMALL_GRID_SIZE);
        const defaultScore = scoreSnakeModel(straightModel, [SMALL_GRID_SEED]);

        // Check only the small grid has the apple on the way
        expect(smallScore).toBe(1);
        expect(defaultScore).toBe(0);
    });

    test('refuses to score without a game', () => {
        expect(() => scoreSnakeModel(makeStraightModel(), [])).toThrow(
            'Snake model needs at least one game to score',
        );
    });
});
