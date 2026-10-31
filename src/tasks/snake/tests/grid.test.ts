import { describe, expect, test } from 'vitest';
import { isInsideGrid, moveCell, type Cell } from '../grid';
import type { Direction } from '../direction';

// One move to check, with the cell it should land on
interface MoveCase {
    direction: Direction;
    expected: Cell;
}

// Cell every move starts from
const START: Cell = { x: 5, y: 5 };

// Default grid size
const GRID_SIZE = 20;

// Each direction with the cell one step away from START
const MOVE_CASES: MoveCase[] = [
    { direction: 'up', expected: { x: 5, y: 4 } },
    { direction: 'down', expected: { x: 5, y: 6 } },
    { direction: 'left', expected: { x: 4, y: 5 } },
    { direction: 'right', expected: { x: 6, y: 5 } },
];

// Edge cells inside
const INSIDE_CELLS: Cell[] = [
    { x: 0, y: 0 },
    { x: 19, y: 19 },
];

// Edge cells outside
const OUTSIDE_CELLS: Cell[] = [
    { x: -1, y: 5 },
    { x: 20, y: 5 },
    { x: 5, y: -1 },
    { x: 5, y: 20 },
];

describe('moveCell', () => {
    test.each(MOVE_CASES)('moving $direction', ({ direction, expected }) => {
        // Check the cell it lands on
        expect(moveCell(START, direction)).toEqual(expected);
    });
});

describe('isInsideGrid', () => {
    test('corners are inside', () => {
        // Check both corners count as inside
        for (const cell of INSIDE_CELLS) {
            expect(isInsideGrid(cell, GRID_SIZE)).toBe(true);
        }
    });

    test('cells past any edge are outside', () => {
        // Check one step past each edge counts as outside
        for (const cell of OUTSIDE_CELLS) {
            expect(isInsideGrid(cell, GRID_SIZE)).toBe(false);
        }
    });
});
