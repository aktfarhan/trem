import { isSameCell, pickRandomCell, type Cell } from './grid';
import { createSeededRandom, type Random } from '../../lib/seeded-random';
import type { Direction } from './direction';

// How a game ended
export type DeathCause = 'wall' | 'self' | 'time';

// Everything about one game
export interface SnakeState {
    body: Cell[];
    apple: Cell;
    score: number;
    random: Random;
    gridSize: number;
    direction: Direction;
    deathCause: DeathCause | null;
    movesSinceApple: number;
}

// Default grid width and height
export const DEFAULT_GRID_SIZE = 20;

// Number of cells the snake starts with
const START_LENGTH = 3;

// Pick cells until one is off the snake
function placeApple(body: Cell[], gridSize: number, random: Random): Cell {
    // Start with any cell
    let apple = pickRandomCell(gridSize, random);

    // Keep repicking if the cell is not free
    while (body.some((segment) => isSameCell(segment, apple))) {
        apple = pickRandomCell(gridSize, random);
    }

    return apple;
}

/**
 * Creates a new snake game.
 *
 * @param seed - Starting number that picks the apples.
 * @param gridSize - Width and height of the square grid.
 * @returns Starting state, with the snake in the middle of the grid.
 */
export function createSnakeGame(seed: number, gridSize = DEFAULT_GRID_SIZE): SnakeState {
    // Generator for this game's apples
    const random = createSeededRandom(seed);

    // Build the body from the middle cell
    const middle = Math.floor(gridSize / 2);
    const body = Array.from({ length: START_LENGTH }, (_, index) => ({
        x: middle - index,
        y: middle,
    }));

    // Place the first apple
    const apple = placeApple(body, gridSize, random);

    return {
        body,
        apple,
        score: 0,
        random,
        gridSize,
        direction: 'right',
        deathCause: null,
        movesSinceApple: 0,
    };
}
