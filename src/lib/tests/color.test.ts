import { describe, expect, test } from 'vitest';
import { mixColors, parseHexColor } from '../color';

// Snake color
const SNAKE_HEX = '#1d9e75';

// Board color
const BOARD_HEX = '#181816';

describe('parseHexColor', () => {
    test('reads each part as a number', () => {
        // Read the snake color
        const color = parseHexColor(SNAKE_HEX);

        // Check 1d, 9e, and 75 in base 10
        expect(color).toEqual({ red: 29, green: 158, blue: 117 });
    });
});

describe('mixColors', () => {
    test('gives the first color at 0 and the second color at 1', () => {
        // Mix at both ends
        const snake = parseHexColor(SNAKE_HEX);
        const board = parseHexColor(BOARD_HEX);

        // Check nothing is mixed at the ends
        expect(mixColors(snake, board, 0)).toBe('rgb(29, 158, 117)');
        expect(mixColors(snake, board, 1)).toBe('rgb(24, 24, 22)');
    });

    test('rounds each part to a whole number', () => {
        // Mix halfway
        const mixed = mixColors(parseHexColor(SNAKE_HEX), parseHexColor(BOARD_HEX), 0.5);

        // Check 26.5 -> 27, 91 stays, 69.5 -> 70
        expect(mixed).toBe('rgb(27, 91, 70)');
    });
});
