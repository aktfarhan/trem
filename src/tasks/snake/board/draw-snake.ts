import { fillCircle, findCenter } from './canvas';
import { OFFSET_BY_DIRECTION, type Cell } from '../grid';
import type { SnakeState } from '../game';
import type { BoardColors } from './colors';
import type { Direction } from '../direction';

// Sizes as a share of one cell
const CELL_SHARE = {
    eye: 0.11,
    inset: 0.083,
    pupil: 0.054,
    corner: 0.25,
    eyeSpread: 0.19,
    eyeForward: 0.125,
    pupilShift: 0.04,
} as const;

// Snake's width as a share of one cell
const BODY_SHARE = 1 - CELL_SHARE.inset * 2;

// How far the tail fades toward the board color
const TAIL_FADE = 0.45;

// Which side of the head each eye is on
const EYE_SIDES = [-1, 1];

// Fill the traced shape with the snake color
function fillFaded(context: CanvasRenderingContext2D, colors: BoardColors, amount: number): void {
    // Lay the board color first
    context.fillStyle = colors.board;
    context.fill();

    // Fill the snake color on top
    context.save();
    context.globalAlpha = 1 - amount;
    context.fillStyle = colors.snake;
    context.fill();
    context.restore();
}

// Trace the rounded square a snake piece fills
function traceSquare(context: CanvasRenderingContext2D, cell: Cell, cellSize: number): void {
    const inset = cellSize * CELL_SHARE.inset;
    const width = cellSize * BODY_SHARE;
    context.beginPath();
    context.roundRect(
        cell.x * cellSize + inset,
        cell.y * cellSize + inset,
        width,
        width,
        cellSize * CELL_SHARE.corner,
    );
}

// Trace the strip joining two neighboring cells
function traceBridge(
    context: CanvasRenderingContext2D,
    from: Cell,
    to: Cell,
    cellSize: number,
): void {
    const inset = cellSize * CELL_SHARE.inset;
    const width = cellSize * BODY_SHARE;
    context.beginPath();

    // Same row: a strip going across
    if (from.y === to.y) {
        const left = Math.min(from.x, to.x) * cellSize + cellSize / 2;
        context.rect(left, from.y * cellSize + inset, cellSize, width);
        return;
    }

    // Same column: a strip going down
    const top = Math.min(from.y, to.y) * cellSize + cellSize / 2;
    context.rect(from.x * cellSize + inset, top, width, cellSize);
}

// Draw the body from the tail to the neck
function drawBody(
    context: CanvasRenderingContext2D,
    body: Cell[],
    cellSize: number,
    colors: BoardColors,
): void {
    // Walk from the tail toward the head
    for (let i = body.length - 1; i > 0; i--) {
        // Fill the segment's square
        traceSquare(context, body[i], cellSize);
        fillFaded(context, colors, (i / body.length) * TAIL_FADE);

        // Fill the bridge to the next segment
        traceBridge(context, body[i], body[i - 1], cellSize);
        fillFaded(context, colors, ((i - 0.5) / body.length) * TAIL_FADE);
    }
}

// Draw the head as a rounded square with two eyes
function drawHead(
    context: CanvasRenderingContext2D,
    head: Cell,
    direction: Direction,
    cellSize: number,
    colors: BoardColors,
): void {
    // Fill the head's square
    traceSquare(context, head, cellSize);
    context.fillStyle = colors.snakeHead;
    context.fill();

    // Steps from the center toward the front of the head
    const center = findCenter(head, cellSize);
    const forward = OFFSET_BY_DIRECTION[direction];
    const ahead = cellSize * CELL_SHARE.eyeForward;
    const shift = cellSize * CELL_SHARE.pupilShift;

    // Place each eye ahead of center to the side
    for (const side of EYE_SIDES) {
        // Sideways is the forward step turned a quarter
        const spread = cellSize * CELL_SHARE.eyeSpread * side;
        const eye = {
            x: center.x + forward.x * ahead - forward.y * spread,
            y: center.y + forward.y * ahead + forward.x * spread,
        };

        // Fill the eye and pupil
        const pupil = { x: eye.x + forward.x * shift, y: eye.y + forward.y * shift };
        context.fillStyle = colors.eye;
        fillCircle(context, eye, cellSize * CELL_SHARE.eye);
        context.fillStyle = colors.pupil;
        fillCircle(context, pupil, cellSize * CELL_SHARE.pupil);
    }
}

/**
 * Draws the snake.
 *
 * @param context - Canvas to draw on.
 * @param state - Game whose snake to draw.
 * @param cellSize - Width and height of one cell.
 * @param colors - Colors from readBoardColors.
 */
export function drawSnake(
    context: CanvasRenderingContext2D,
    state: SnakeState,
    cellSize: number,
    colors: BoardColors,
): void {
    drawBody(context, state.body, cellSize, colors);
    drawHead(context, state.body[0], state.direction, cellSize, colors);
}
