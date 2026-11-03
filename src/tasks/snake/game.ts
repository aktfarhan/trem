import { drawRandom } from '../../lib/seeded-random';
import type { Cell } from './grid';
import type { Direction } from './direction';

// How a game ended
export type EndReason = 'wall' | 'self' | 'time' | 'win';

// Everything about one game
export interface SnakeState {
    body: Cell[];
    apple: Cell;
    score: number;
    gridSize: number;
    direction: Direction;
    endReason: EndReason | null;
    randomPosition: number;
    movesSinceApple: number;
}

// New apple and the random position after picking it
type ApplePlacement = Pick<SnakeState, 'apple' | 'randomPosition'>;

// Default grid width and height
export const DEFAULT_GRID_SIZE = 20;

// Number of cells the snake starts with
const START_LENGTH = 3;

/**
 * Picks a random free cell for the apple.
 *
 * @param body - Cells the snake is on.
 * @param gridSize - Width and height of the grid.
 * @param randomPosition - Position in the random sequence to draw from.
 * @returns Cell that is not under the snake, and the next random position.
 */
export function placeApple(body: Cell[], gridSize: number, randomPosition: number): ApplePlacement {
    // 1. Number each cell, and save ones under the snake
    const findCellIndex = (cell: Cell) => cell.y * gridSize + cell.x;
    const bodyIndexSet = new Set(body.map(findCellIndex));

    // 2. List every cell the snake is not on
    const freeCells: Cell[] = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            // Keep the cell unless the snake is on it
            const cell = { x, y };
            if (bodyIndexSet.has(findCellIndex(cell))) continue;
            freeCells.push(cell);
        }
    }

    // 3. Draw one random number and take the free cell
    const draw = drawRandom(randomPosition);
    const appleIndex = Math.floor(draw.value * freeCells.length);
    return { apple: freeCells[appleIndex], randomPosition: draw.position };
}

/**
 * Creates a new snake game.
 *
 * @param seed - Starting number that picks the apples.
 * @param gridSize - Width and height of the square grid.
 * @returns Starting state, with the snake in the middle of the grid.
 */
export function createSnakeGame(seed: number, gridSize = DEFAULT_GRID_SIZE): SnakeState {
    // Build the body from the middle cell
    const middle = Math.floor(gridSize / 2);
    const body = Array.from({ length: START_LENGTH }, (_, index) => ({
        x: middle - index,
        y: middle,
    }));

    // Place the first apple
    const { apple, randomPosition } = placeApple(body, gridSize, seed);

    return {
        body,
        apple,
        score: 0,
        gridSize,
        direction: 'right',
        endReason: null,
        randomPosition,
        movesSinceApple: 0,
    };
}
