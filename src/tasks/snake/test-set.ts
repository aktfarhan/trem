import { playModelGame } from './fitness';
import type { SnakeModel } from './model';

// How far a test run has reached
export interface TestProgress {
    gamesPlayed: number;
    averageScore: number;
}

// Games in the test set
export const TEST_SET_SIZE = 1_000;

// Seed of the first test game
const FIRST_TEST_SEED = 9_000_000;

// Seed of every test game
export const TEST_SET_SEEDS = Array.from({ length: TEST_SET_SIZE }, (_, i) => FIRST_TEST_SEED + i);

/**
 * Plays every test set game with a model, and reports after each one.
 *
 * @param model - Model to test.
 * @param gridSize - Width and height of the grid.
 * @param onProgress - Gets the games played so far and their average apples.
 */
export function testSnakeModel(
    model: SnakeModel,
    gridSize: number,
    onProgress: (progress: TestProgress) => void,
): void {
    // Play every test game
    let appleCount = 0;
    let gamesPlayed = 0;
    for (const seed of TEST_SET_SEEDS) {
        appleCount += playModelGame(model, seed, gridSize).score;
        gamesPlayed++;

        // Report the games so far and their average
        onProgress({ gamesPlayed, averageScore: appleCount / gamesPlayed });
    }
}
