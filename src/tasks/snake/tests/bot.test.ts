import { stepSnakeGame } from '../step';
import { chooseBotAction } from '../bot';
import { describe, expect, test } from 'vitest';
import { createSnakeGame, type SnakeState } from '../game';
import type { Cell } from '../grid';
import type { SnakeAction } from '../direction';

// One apple to chase, with the move that gets closest to it
interface AppleCase {
    apple: Cell;
    expected: SnakeAction;
}

// Seed shared by every bot test
const SEED = 42;

// Apple behind the starting head
const BEHIND_APPLE: Cell = { x: 5, y: 10 };

// Apple below the curled snake
const BELOW_APPLE: Cell = { x: 5, y: 15 };

// Apple on the wall snake's row
const ROW_APPLE: Cell = { x: 12, y: 10 };

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

// Snake facing right in the top right corner
const TRAPPED_BODY: Cell[] = [
    { x: 19, y: 0 },
    { x: 18, y: 0 },
    { x: 18, y: 1 },
    { x: 19, y: 1 },
    { x: 19, y: 2 },
];

// Apples ahead, up and down from the starting head, with the move toward each
const APPLE_CASES: AppleCase[] = [
    { apple: { x: 15, y: 10 }, expected: 'straight' },
    { apple: { x: 10, y: 2 }, expected: 'left' },
    { apple: { x: 10, y: 18 }, expected: 'right' },
];

// Start a game with given fields
function makeState(changes: Partial<SnakeState>): SnakeState {
    return { ...createSnakeGame(SEED), ...changes };
}

describe('chooseBotAction', () => {
    test.each(APPLE_CASES)('goes $expected toward the apple', ({ apple, expected }) => {
        // Pick a move with the apple in place
        const action = chooseBotAction(makeState({ apple }));

        // Check it heads for the apple
        expect(action).toBe(expected);
    });

    test('goes straight when every move is the same distance from the apple', () => {
        // Pick a move with the apple behind the head
        const action = chooseBotAction(makeState({ apple: BEHIND_APPLE }));

        // Check straight wins the tie
        expect(action).toBe('straight');
    });

    test('does not move into its body', () => {
        // Pick a move while curled, with the apple below
        const state = makeState({ body: CURLED_BODY, apple: BELOW_APPLE });
        const action = chooseBotAction(state);

        // Check it skips right
        expect(action).toBe('straight');
    });

    test('turns away from the wall', () => {
        // Pick a move against the wall
        const state = makeState({ body: WALL_BODY, apple: ROW_APPLE });
        const action = chooseBotAction(state);

        // Check it skips straight and left wins the tie with right
        expect(action).toBe('left');
    });

    test('goes straight when every move ends the game', () => {
        // Pick a move while boxed in by the walls and its body
        const action = chooseBotAction(makeState({ body: TRAPPED_BODY }));

        // Check it falls back to straight
        expect(action).toBe('straight');
    });

    test('plays a whole game until it ends', () => {
        // Let the bot pick every move until the game ends
        let state = createSnakeGame(SEED);
        while (state.endReason === null) {
            state = stepSnakeGame(state, chooseBotAction(state));
        }

        // Check it ate at least one apple on the way
        expect(state.score).toBeGreaterThan(0);
    });
});
