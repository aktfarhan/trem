import { stepSnakeGame } from '../step';
import { describe, expect, test } from 'vitest';
import { createSnakeGame, DEFAULT_GRID_SIZE, type SnakeState } from '../game';
import type { Cell } from '../grid';

// Seed shared by every step test
const SEED = 42;

// Corner cell
const FAR_APPLE: Cell = { x: 0, y: 0 };

// Cell straight ahead
const AHEAD_APPLE: Cell = { x: 11, y: 10 };

// Snake against the right wall
const WALL_BODY: Cell[] = [
    { x: 19, y: 10 },
    { x: 18, y: 10 },
    { x: 17, y: 10 },
];

// Snake turning into its body
const CURLED_BODY: Cell[] = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
];

// Snake in a square
const SQUARE_BODY: Cell[] = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 5 },
];

// Snake facing down
const NEAR_FULL_BODY: Cell[] = [
    { x: 0, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
];

// Start a game with given fields
function makeState(changes: Partial<SnakeState>): SnakeState {
    return { ...createSnakeGame(SEED), ...changes };
}

describe('stepSnakeGame', () => {
    test('going straight moves the head one cell forward', () => {
        // Step straight from the start
        const next = stepSnakeGame(makeState({ apple: FAR_APPLE }), 'straight');

        // Check the body moved forward and the move was counted
        expect(next.body).toEqual([
            { x: 11, y: 10 },
            { x: 10, y: 10 },
            { x: 9, y: 10 },
        ]);
        expect(next.movesSinceApple).toBe(1);
        expect(next.endReason).toBeNull();
    });

    test('turning changes direction before moving', () => {
        // Turn left while facing right
        const next = stepSnakeGame(makeState({ apple: FAR_APPLE }), 'left');

        // Check it now faces up and moved up
        expect(next.direction).toBe('up');
        expect(next.body[0]).toEqual({ x: 10, y: 9 });
    });

    test('hitting a wall ends the game', () => {
        // Step straight into the right wall
        const state = makeState({ body: WALL_BODY, apple: FAR_APPLE });
        const next = stepSnakeGame(state, 'straight');

        // Check the reason
        expect(next.endReason).toBe('wall');
    });

    test('hitting itself ends the game', () => {
        // Turn right into its own body
        const state = makeState({ body: CURLED_BODY, apple: FAR_APPLE });
        const next = stepSnakeGame(state, 'right');

        // Check the reason
        expect(next.endReason).toBe('self');
    });

    test('moving into the cell the tail is leaving is safe', () => {
        // Turn left into the tail's cell
        const state = makeState({
            body: SQUARE_BODY,
            apple: FAR_APPLE,
            direction: 'up',
        });
        const next = stepSnakeGame(state, 'left');

        // Check it is still alive with its head where the tail was
        expect(next.endReason).toBeNull();
        expect(next.body[0]).toEqual({ x: 4, y: 5 });
    });

    test('eating an apple grows it by one and scores', () => {
        // Step straight onto the apple
        const state = makeState({ apple: AHEAD_APPLE, movesSinceApple: 5 });
        const next = stepSnakeGame(state, 'straight');

        // Check it grew, scored, and reset the move count
        expect(next.body).toHaveLength(state.body.length + 1);
        expect(next.score).toBe(1);
        expect(next.movesSinceApple).toBe(0);

        // Check the new apple is off the snake
        expect(next.body).not.toContainEqual(next.apple);
    });

    test('too many moves without an apple ends the game', () => {
        // Start one move away from the move limit
        const moveLimit = DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE;
        const state = makeState({
            apple: FAR_APPLE,
            movesSinceApple: moveLimit - 1,
        });
        const next = stepSnakeGame(state, 'straight');

        // Check the reason
        expect(next.endReason).toBe('time');
    });

    test('filling the whole grid wins', () => {
        // Turn left onto the apple in the last free cell
        const state = makeState({
            body: NEAR_FULL_BODY,
            apple: { x: 1, y: 1 },
            gridSize: 2,
            direction: 'down',
        });
        const next = stepSnakeGame(state, 'left');

        // Check the reason
        expect(next.endReason).toBe('win');
    });

    test('a game that has ended does not change', () => {
        // Step a game that already hit a wall
        const state = makeState({ endReason: 'wall' });

        // Check the same state comes back
        expect(stepSnakeGame(state, 'straight')).toBe(state);
    });
});
