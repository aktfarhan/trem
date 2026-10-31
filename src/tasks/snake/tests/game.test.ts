import { describe, expect, test } from 'vitest';
import { turn, type Direction, type SnakeAction } from '../game';

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

describe('turn', () => {
    test.each(TURN_CASES)(
        'facing $from then $action faces $expected',
        ({ from, action, expected }) => {
            // Check the new direction
            expect(turn(from, action)).toBe(expected);
        },
    );
});
