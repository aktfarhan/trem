import { stepSnakeGame } from './step';
import { chooseModelAction, type SnakeModel } from './model';
import { createSnakeGame, DEFAULT_GRID_SIZE, type SnakeState } from './game';

/**
 * Plays a game with a model.
 *
 * @param model - Model that picks every move.
 * @param seed - Starting number that picks the apples.
 * @param gridSize - Width and height of the grid.
 * @returns Game state at the end.
 */
export function playModelGame(
    model: SnakeModel,
    seed: number,
    gridSize = DEFAULT_GRID_SIZE,
): SnakeState {
    // Let the model pick every move until the game ends
    let state = createSnakeGame(seed, gridSize);
    while (state.endReason === null) {
        const action = chooseModelAction(state, model);
        state = stepSnakeGame(state, action);
    }

    // Return the game as it ended
    return state;
}

/**
 * Scores a model by the apples it eats in each game.
 *
 * @param model - Model to score.
 * @param seeds - One seed per game.
 * @param gridSize - Width and height of the grid.
 * @returns Average apples per game.
 */
export function scoreSnakeModel(
    model: SnakeModel,
    seeds: number[],
    gridSize = DEFAULT_GRID_SIZE,
): number {
    // Refuse to score without a game to play
    if (seeds.length === 0) throw new Error('Snake model needs at least one game to score');

    // Add up the apples from every game
    let appleCount = 0;
    for (const seed of seeds) {
        appleCount += playModelGame(model, seed, gridSize).score;
    }

    // Return the average apples per game
    return appleCount / seeds.length;
}
