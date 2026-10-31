import { createSeededRandom, type Random } from '../../lib/seeded-random';

// Square on the grid, x -> right, y -> down
export interface Cell {
    x: number;
    y: number;
}

// The way the snake is facing
export type Direction = 'up' | 'down' | 'left' | 'right';

// Move picked by the model
export type SnakeAction = 'straight' | 'left' | 'right';

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

// New direction for each current direction and action
const TURN_MAP: Record<Direction, Record<SnakeAction, Direction>> = {
    up: { left: 'left', right: 'right', straight: 'up' },
    down: { left: 'right', right: 'left', straight: 'down' },
    left: { left: 'down', right: 'up', straight: 'left' },
    right: { left: 'up', right: 'down', straight: 'right' },
};

// Default grid width and height
export const DEFAULT_GRID_SIZE = 20;

// Number of cells the snake starts with
const START_LENGTH = 3;

/**
 * Returns the direction the snake faces after an action.
 *
 * @param direction - Way the snake is facing now.
 * @param action - Move picked by the model.
 * @returns New direction.
 */
export function turn(direction: Direction, action: SnakeAction): Direction {
    return TURN_MAP[direction][action];
}

// Check whether two cells are the same square
function isSameCell(first: Cell, second: Cell) {
    return first.x === second.x && first.y === second.y;
}

// Pick a random cell anywhere on the grid
function pickRandomCell(gridSize: number, random: Random): Cell {
    return {
        x: Math.floor(random() * gridSize),
        y: Math.floor(random() * gridSize),
    };
}

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
