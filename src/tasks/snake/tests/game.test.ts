import { describe, expect, test } from 'vitest';
import { drawRandom } from '../../../lib/seeded-random';
import { createSnakeGame, DEFAULT_GRID_SIZE, placeApple } from '../game';
import type { Cell } from '../grid';

// Seed shared by every game test
const SEED = 42;

// How many seeds the apple test tries
const SEED_COUNT = 1000;

// Grid size for the custom size test
const SMALL_GRID_SIZE = 10;

// Starting body on the default 20 x 20 grid
const START_BODY: Cell[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
];

// Grid size for the nearly full board test
const TINY_GRID_SIZE = 2;

// Snake on every cell of the tiny grid but one
const NEAR_FULL_BODY: Cell[] = [
    { x: 1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
];

// The one cell the nearly full snake leaves free
const LAST_FREE_CELL: Cell = { x: 1, y: 1 };

describe('createSnakeGame', () => {
    test('starts in the middle facing right', () => {
        // Create a game on the default grid
        const game = createSnakeGame(SEED);

        // Check where it starts and which way it faces
        expect(game.body).toEqual(START_BODY);
        expect(game.direction).toBe('right');
    });

    test('starts alive with nothing eaten', () => {
        // Create a game on the default grid
        const game = createSnakeGame(SEED);

        // Check it has not died, scored or moved yet
        expect(game.endReason).toBeNull();
        expect(game.score).toBe(0);
        expect(game.movesSinceApple).toBe(0);
    });

    test('always places the apple on the grid and off the snake', () => {
        // Try many seeds
        const seeds = Array.from({ length: SEED_COUNT }, (_, index) => index);

        for (const seed of seeds) {
            // Create a game with this seed
            const game = createSnakeGame(seed);

            // Check the apple is inside the grid
            expect(game.apple.x).toBeGreaterThanOrEqual(0);
            expect(game.apple.x).toBeLessThan(game.gridSize);
            expect(game.apple.y).toBeGreaterThanOrEqual(0);
            expect(game.apple.y).toBeLessThan(game.gridSize);

            // Check the apple is not under the snake
            expect(game.body).not.toContainEqual(game.apple);
        }
    });

    test('same seed gives the same apple', () => {
        // Create two games from the same seed
        const first = createSnakeGame(SEED);
        const second = createSnakeGame(SEED);

        // Compare
        expect(first.apple).toEqual(second.apple);
    });

    test('uses the grid size it is given', () => {
        // Create a game on a smaller grid
        const game = createSnakeGame(SEED, SMALL_GRID_SIZE);

        // Check the size and that it starts in the middle
        expect(game.gridSize).toBe(SMALL_GRID_SIZE);
        expect(game.body[0]).toEqual({ x: 5, y: 5 });
    });
});

describe('placeApple', () => {
    test('puts the apple on the only free cell', () => {
        // Place an apple with one cell left
        const placement = placeApple(NEAR_FULL_BODY, TINY_GRID_SIZE, SEED);

        // Check it took that cell
        expect(placement.apple).toEqual(LAST_FREE_CELL);
    });

    test('moves the random position one draw forward', () => {
        // Place an apple from the shared seed
        const placement = placeApple(START_BODY, DEFAULT_GRID_SIZE, SEED);

        // Check the next apple will draw from a new position
        expect(placement.randomPosition).toBe(drawRandom(SEED).position);
    });
});
