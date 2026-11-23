import { testSnakeModel } from './test-set';
import type { SnakeModel } from './model';
import type { GameResults } from './fitness';

// Snake the page wants tested, and the test games it already played
export interface TestOrder {
    model: SnakeModel;
    played: GameResults;
    gridSize: number;
}

// Test the snake the page sends on the games left, and report after every game
self.onmessage = (e: MessageEvent<TestOrder>) => {
    const { model, played, gridSize } = e.data;
    testSnakeModel(model, gridSize, played, (progress) => {
        self.postMessage(progress);
    });
};
