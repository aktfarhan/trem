import { playModelGame, type GameResults } from './fitness';
import type { SnakeModel } from './model';

// Games in the test set
export const TEST_SET_SIZE = 1_000;

// Seed of the first test game
const FIRST_TEST_SEED = 9_000_000;

// Seed of every test game
export const TEST_SET_SEEDS = Array.from({ length: TEST_SET_SIZE }, (_, i) => FIRST_TEST_SEED + i);

/**
 * Plays the test set games, and reports after each one.
 *
 * @param model - Model to test.
 * @param gridSize - Width and height of the grid.
 * @param played - Test games already played from the first, and their apples.
 * @param onProgress - Gets the test games played so far and their apples.
 */
export function testSnakeModel(
    model: SnakeModel,
    gridSize: number,
    played: GameResults,
    onProgress: (progress: GameResults) => void,
): void {
    // Play every test game left
    let { appleCount, gamesPlayed } = played;
    for (const seed of TEST_SET_SEEDS.slice(gamesPlayed)) {
        appleCount += playModelGame(model, seed, gridSize).score;
        gamesPlayed++;

        // Report the games so far and their apples
        onProgress({ appleCount, gamesPlayed });
    }
}
