import { describe, expect, test } from 'vitest';
import { fitBoard, MAX_BOARD_SIZE, MIN_WRAP_WIDTH } from '../board/fit';

// Height of the lines around the board
const RESERVED_HEIGHT = 80;

describe('fitBoard', () => {
    test('fills the width when the space is narrow', () => {
        // Fit into a tall, narrow space
        const fit = fitBoard(500, 900, RESERVED_HEIGHT);

        // Check the board takes the whole width
        expect(fit).toEqual({ boardSize: 500, wrapWidth: 500 });
    });

    test('fills the height left over when the space is short', () => {
        // Fit into a wide, short space
        const fit = fitBoard(1000, 600, RESERVED_HEIGHT);

        // Check the board takes the correct height and wrap
        expect(fit).toEqual({ boardSize: 520, wrapWidth: MIN_WRAP_WIDTH });
    });

    test('stops at the largest board size', () => {
        // Fit into a huge space
        const fit = fitBoard(2000, 2000, RESERVED_HEIGHT);

        // Check the board stops at its cap
        expect(fit).toEqual({ boardSize: MAX_BOARD_SIZE, wrapWidth: MAX_BOARD_SIZE });
    });

    test('rounds down to whole pixels', () => {
        // Fit into a space with a fractional width
        const fit = fitBoard(500.7, 900, RESERVED_HEIGHT);

        // Check the board is a whole number
        expect(fit.boardSize).toBe(500);
    });

    test('stays at 0 before the space is measured', () => {
        // Fit into no space at all
        const fit = fitBoard(0, 0, RESERVED_HEIGHT);

        // Check nothing goes below 0
        expect(fit).toEqual({ boardSize: 0, wrapWidth: 0 });
    });
});
