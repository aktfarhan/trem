import { testSnakeModel } from './test-set';
import type { SnakeModel } from './model';

// Snake the page wants tested
export interface TestOrder {
    model: SnakeModel;
    gridSize: number;
}

// Test the snake the page sends, and report after every game
self.onmessage = (e: MessageEvent<TestOrder>) => {
    const { model, gridSize } = e.data;
    testSnakeModel(model, gridSize, (progress) => {
        self.postMessage(progress);
    });
};
