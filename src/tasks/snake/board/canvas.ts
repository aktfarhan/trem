import type { Cell } from '../grid';

// Position on the canvas
export interface Point {
    x: number;
    y: number;
}

// One full turn of a circle
export const FULL_TURN = Math.PI * 2;

/**
 * Finds the pixel at the middle of the cell.
 *
 * @param cell - Cell to find the middle of.
 * @param cellSize - Width and height of one cell.
 * @returns Center of the cell on the canvas.
 */
export function findCenter(cell: Cell, cellSize: number): Point {
    return { x: cell.x * cellSize + cellSize / 2, y: cell.y * cellSize + cellSize / 2 };
}

/**
 * Fills a circle around a point with the current fill color.
 *
 * @param context - Canvas to draw on.
 * @param center - Middle of the circle.
 * @param radius - Radius of the circle.
 */
export function fillCircle(context: CanvasRenderingContext2D, center: Point, radius: number): void {
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, FULL_TURN);
    context.fill();
}
