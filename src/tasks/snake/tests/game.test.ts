import { describe, expect, test } from 'vitest';
import { turn, createSnakeGame } from '../game';
import type { Cell, Direction, SnakeAction } from '../game';

// One turn to check, with the direction it should end up facing
interface TurnCase {
    from: Direction;
    action: SnakeAction;
    expected: Direction;
}

// Every direction and action with the direction it should end up facing
const TURN_CASES: TurnCase[] = [
    { from: 'up', action: 'left', expected: 'left' },
    { from: 'up', action: 'right', expected: 'right' },
    { from: 'up', action: 'straight', expected: 'up' },
    { from: 'down', action: 'left', expected: 'right' },
    { from: 'down', action: 'right', expected: 'left' },
    { from: 'down', action: 'straight', expected: 'down' },
    { from: 'left', action: 'left', expected: 'down' },
    { from: 'left', action: 'right', expected: 'up' },
    { from: 'left', action: 'straight', expected: 'left' },
    { from: 'right', action: 'left', expected: 'up' },
    { from: 'right', action: 'right', expected: 'down' },
    { from: 'right', action: 'straight', expected: 'right' },
];

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

describe('turn', () => {
    test.each(TURN_CASES)(
        'facing $from then $action faces $expected',
        ({ from, action, expected }) => {
            // Check the new direction
            expect(turn(from, action)).toBe(expected);
        },
    );
});

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
        expect(game.deathCause).toBeNull();
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
