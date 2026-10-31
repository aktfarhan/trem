import type { Random } from '../../lib/seeded-random';

// Square on the grid, x -> right, y -> down
export interface Cell {
    x: number;
    y: number;
}

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
