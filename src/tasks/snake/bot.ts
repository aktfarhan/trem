import { isMoveDangerous } from './observe';
import { moveCell, type Cell } from './grid';
import { turn, type SnakeAction } from './direction';
import type { SnakeState } from './game';

// Moves to try, in the order that wins a tie
const MOVE_ORDER: SnakeAction[] = ['straight', 'left', 'right'];

// L1 norm: steps across + steps down between two cells
function measureDistance(from: Cell, to: Cell): number {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

/**
 * Picks a move with fixed rules.
 *
 * @param state - Game to pick a move for.
 * @returns Move to make next.
 */
export function chooseBotAction(state: SnakeState): SnakeAction {
    // Keep only the moves that do not end the game
    const safeMoves = MOVE_ORDER.filter((move) => !isMoveDangerous(state, move));

    // Go straight when every move ends the game
    if (safeMoves.length === 0) return 'straight';

    // Find how far each safe move lands from the apple
    const distances = safeMoves.map((move) => {
        const cell = moveCell(state.body[0], turn(state.direction, move));
        return measureDistance(cell, state.apple);
    });

    // Pick the closest move
    const closestIndex = distances.indexOf(Math.min(...distances));
    return safeMoves[closestIndex];
}
