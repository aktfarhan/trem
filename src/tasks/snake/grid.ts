import type { Direction } from './direction';
import type { Random } from '../../lib/seeded-random';

// Square on the grid, x -> right, y -> down
export interface Cell {
    x: number;
    y: number;
}

// Change in x and y for one move in each direction
export const OFFSET_BY_DIRECTION: Record<Direction, Cell> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

/**
 * Checks whether two cells are the same square.
 *
 * @param first - One cell to compare.
 * @param second - The other cell to compare.
 * @returns True when both cells have the same x and y.
 */
export function isSameCell(first: Cell, second: Cell): boolean {
    return first.x === second.x && first.y === second.y;
}

/**
 * Picks a random cell anywhere on the grid.
 *
 * @param gridSize - Width and height of the grid.
 * @param random - Generator that picks the cell.
 * @returns Random cell inside the grid.
 */
export function pickRandomCell(gridSize: number, random: Random): Cell {
    return {
        x: Math.floor(random() * gridSize),
        y: Math.floor(random() * gridSize),
    };
}

/**
 * Returns the cell one step away in a direction.
 *
 * @param cell - Cell to move from.
 * @param direction - Way to move.
 * @returns Neighboring cell.
 */
export function moveCell(cell: Cell, direction: Direction): Cell {
    const offset = OFFSET_BY_DIRECTION[direction];
    return { x: cell.x + offset.x, y: cell.y + offset.y };
}

/**
 * Checks whether a cell is inside the grid.
 *
 * @param cell - Cell to check.
 * @param gridSize - Width and height of the grid.
 * @returns True when both x and y are from 0 up to gridSize.
 */
export function isInsideGrid(cell: Cell, gridSize: number): boolean {
    const isInsideX = cell.x >= 0 && cell.x < gridSize;
    const isInsideY = cell.y >= 0 && cell.y < gridSize;
    return isInsideX && isInsideY;
}
