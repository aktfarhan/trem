import { drawSnake } from './draw-snake';
import { FULL_TURN, fillCircle, findCenter } from './canvas';
import type { Cell } from '../grid';
import type { SnakeState } from '../game';
import type { BoardColors } from './colors';

// Apple sizes as a share of one cell
const APPLE = {
    drop: 0.04,
    radius: 0.34,
} as const;

// Leaf on the apple
const LEAF = {
    x: 0.125,
    y: -0.3,
    tilt: -0.6,
    width: 0.146,
    height: 0.083,
} as const;

// Width of a grid line
const GRID_LINE_WIDTH = 1;

// Opacity of the cover that fades the board when a game ends
const END_FADE = 0.55;

// Draw a line along every border between cells
function drawGrid(
    context: CanvasRenderingContext2D,
    gridSize: number,
    cellSize: number,
    color: string,
): void {
    // Length of every line
    const boardSize = gridSize * cellSize;

    // Trace one vertical and horizontal line per border
    context.strokeStyle = color;
    context.lineWidth = GRID_LINE_WIDTH;
    context.beginPath();
    for (let i = 1; i < gridSize; i++) {
        const offset = i * cellSize;
        context.moveTo(offset, 0);
        context.lineTo(offset, boardSize);
        context.moveTo(0, offset);
        context.lineTo(boardSize, offset);
    }

    // Draw them all
    context.stroke();
}

// Draw the apple as a circle with a small leaf
function drawApple(
    context: CanvasRenderingContext2D,
    apple: Cell,
    cellSize: number,
    colors: BoardColors,
): void {
    // Fill the apple a little low
    const center = findCenter(apple, cellSize);
    const appleCenter = { x: center.x, y: center.y + cellSize * APPLE.drop };
    context.fillStyle = colors.apple;
    fillCircle(context, appleCenter, cellSize * APPLE.radius);

    // Fill the leaf
    const leafX = center.x + cellSize * LEAF.x;
    const leafY = center.y + cellSize * LEAF.y;
    context.fillStyle = colors.leaf;
    context.beginPath();
    context.ellipse(
        leafX,
        leafY,
        cellSize * LEAF.width,
        cellSize * LEAF.height,
        LEAF.tilt,
        0,
        FULL_TURN,
    );
    context.fill();
}

/**
 * Draws a snake game onto a canvas.
 *
 * @param context - Canvas to draw on.
 * @param state - Game to draw.
 * @param colors - Colors from readBoardColors.
 * @param boardSize - Width and height of the board.
 */
export function drawSnakeGame(
    context: CanvasRenderingContext2D,
    state: SnakeState,
    colors: BoardColors,
    boardSize: number,
): void {
    // Width and height of one cell
    const cellSize = boardSize / state.gridSize;

    // 1. Fill the background
    context.fillStyle = colors.board;
    context.fillRect(0, 0, boardSize, boardSize);

    // 2. Draw the grid, apple and snake
    drawGrid(context, state.gridSize, cellSize, colors.grid);
    drawApple(context, state.apple, cellSize, colors);
    drawSnake(context, state, cellSize, colors);

    // 3. Fade everything when the game has ended
    if (state.endReason === null) return;
    context.save();
    context.globalAlpha = END_FADE;
    context.fillStyle = colors.board;
    context.fillRect(0, 0, boardSize, boardSize);
    context.restore();
}
