import { describe, expect, test } from 'vitest';
import { createSnakeGame, type SnakeState } from '../game';
import { BASIC_GROUPS, listSignalNames, observeSnakeGame } from '../observe';
import type { Cell } from '../grid';
import type { Direction } from '../direction';

// One direction to face, with facing signals it should give
interface FacingCase {
    facing: Direction;
    expected: number[];
}

// Seed shared by every observe test
const SEED = 42;

// Number of signals in the basic groups
const BASIC_SIGNAL_COUNT = 11;

// Apple up and to the left of the starting head
const CORNER_APPLE: Cell = { x: 0, y: 0 };

// Apple on the same row as the starting head
const AHEAD_APPLE: Cell = { x: 15, y: 10 };

// Snake against the right wall
const WALL_BODY: Cell[] = [
    { x: 19, y: 10 },
    { x: 18, y: 10 },
    { x: 17, y: 10 },
];

// Snake facing right
const CURLED_BODY: Cell[] = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
];

// Snake facing up in a square, with tail just left of its head
const SQUARE_BODY: Cell[] = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 5 },
];

// Each direction with the one facing signal that should be on
const FACING_CASES: FacingCase[] = [
    { facing: 'up', expected: [1, 0, 0, 0] },
    { facing: 'down', expected: [0, 1, 0, 0] },
    { facing: 'left', expected: [0, 0, 1, 0] },
    { facing: 'right', expected: [0, 0, 0, 1] },
];

// Start a game with given fields
function makeState(changes: Partial<SnakeState>): SnakeState {
    return { ...createSnakeGame(SEED), ...changes };
}

describe('observeSnakeGame', () => {
    test('sees no danger at the start', () => {
        // Read only the danger signals
        const signals = observeSnakeGame(makeState({}), ['danger']);

        // Check straight, left and right are all safe
        expect(signals).toEqual([0, 0, 0]);
    });

    test('sees the wall straight ahead', () => {
        // Read the danger signals against the right wall
        const state = makeState({ body: WALL_BODY });
        const signals = observeSnakeGame(state, ['danger']);

        // Check only straight is dangerous
        expect(signals).toEqual([1, 0, 0]);
    });

    test('sees its body on its right', () => {
        // Read the danger signals while curled
        const state = makeState({ body: CURLED_BODY });
        const signals = observeSnakeGame(state, ['danger']);

        // Check only right is dangerous
        expect(signals).toEqual([0, 0, 1]);
    });

    test('does not count the tail as danger', () => {
        // Read the danger signals with the tail on its left
        const state = makeState({ body: SQUARE_BODY, direction: 'up' });
        const signals = observeSnakeGame(state, ['danger']);

        // Check left is safe
        expect(signals).toEqual([0, 0, 0]);
    });

    test.each(FACING_CASES)('facing $facing', ({ facing, expected }) => {
        // Read only the facing signals
        const signals = observeSnakeGame(makeState({ direction: facing }), ['facing']);

        // Check only that direction is on
        expect(signals).toEqual(expected);
    });

    test('sees the apple in two directions at once', () => {
        // Read the apple signals with the apple up and to the left
        const state = makeState({ apple: CORNER_APPLE });
        const signals = observeSnakeGame(state, ['apple']);

        // Check up and left are on
        expect(signals).toEqual([1, 0, 1, 0]);
    });

    test('sees the apple in one direction on the same row', () => {
        // Read the apple signals with the apple straight to the right
        const state = makeState({ apple: AHEAD_APPLE });
        const signals = observeSnakeGame(state, ['apple']);

        // Check only right is on
        expect(signals).toEqual([0, 0, 0, 1]);
    });

    test('gives 11 signals for the basic groups', () => {
        // Read every basic signal
        const signals = observeSnakeGame(makeState({}), BASIC_GROUPS);

        // Check the count
        expect(signals).toHaveLength(BASIC_SIGNAL_COUNT);
    });

    test('keeps the same order however the groups are listed', () => {
        // Read the same game with the groups listed in another order
        const state = makeState({});
        const reordered = observeSnakeGame(state, ['apple', 'danger', 'facing']);

        // Check it matches the basic order
        expect(reordered).toEqual(observeSnakeGame(state, BASIC_GROUPS));
    });
});

describe('listSignalNames', () => {
    test('gives one name per signal', () => {
        // List the names of every basic signal
        const names = listSignalNames(BASIC_GROUPS);

        // Check there is a name for each signal
        expect(names).toHaveLength(BASIC_SIGNAL_COUNT);
    });

    test('names the signals in order', () => {
        // List only the danger names
        const names = listSignalNames(['danger']);

        // Check they match the order of the danger signals
        expect(names).toEqual(['Danger straight', 'Danger left', 'Danger right']);
    });
});
