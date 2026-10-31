import { placeApple, type SnakeState } from './game';
import { turn, type SnakeAction } from './direction';
import { isInsideGrid, isSameCell, moveCell } from './grid';

/**
 * Moves the snake one cell and applies the rules.
 *
 * @param state - Game before the move.
 * @param action - Move picked by the model.
 * @returns Game state after the move.
 */
export function stepSnakeGame(state: SnakeState, action: SnakeAction): SnakeState {
    // Skip a game that already ended
    if (state.endReason !== null) return state;

    // 1. Turn, then move the head one cell forward
    const direction = turn(state.direction, action);
    const head = moveCell(state.body[0], direction);

    // 2. End the game if the head leaves the grid
    const isOffGrid = !isInsideGrid(head, state.gridSize);
    if (isOffGrid) return { ...state, direction, endReason: 'wall' };

    // 3. Keep the tail when eating
    const isEating = isSameCell(head, state.apple);
    const keptBody = isEating ? state.body : state.body.slice(0, -1);

    // 4. End the game if the head runs into the body
    const isHittingBody = keptBody.some((segment) => isSameCell(segment, head));
    if (isHittingBody) return { ...state, direction, endReason: 'self' };

    // 5. Add the new head
    const body = [head, ...keptBody];

    // Cells on the grid, also the move limit without eating
    const cellCount = state.gridSize * state.gridSize;

    // 6. Not eating: count the move and end the game at the move limit
    if (!isEating) {
        const movesSinceApple = state.movesSinceApple + 1;
        const endReason = movesSinceApple >= cellCount ? 'time' : null;
        return { ...state, body, direction, endReason, movesSinceApple };
    }

    // 7. Eating: score, then win on a full board or place the next apple
    const score = state.score + 1;
    if (body.length === cellCount) {
        return { ...state, body, score, direction, endReason: 'win' };
    }
    const apple = placeApple(body, state.gridSize, state.random);
    return { ...state, body, apple, score, direction, movesSinceApple: 0 };
}
