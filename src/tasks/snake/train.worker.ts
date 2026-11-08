import {
    createTraining,
    trainGeneration,
    type KeptSnake,
    type RunSeeds,
    type SnakeTraining,
    type TrainingSettings,
} from './train';

// Order the page sends the training worker
export type TrainingCommand =
    | { type: 'start'; seeds: RunSeeds; settings: TrainingSettings }
    | { type: 'pause' }
    | { type: 'resume' };

// How a generation went
export interface GenerationReport {
    newKept: KeptSnake | null;
    bestScore: number;
    generation: number;
    averageScore: number;
}

// MessageChannel: the page's orders get read between generations
const loopChannel = new MessageChannel();

// Training in progress
let training: SnakeTraining | null = null;

// Whether the page paused training
let isPaused = false;

// Whether a next generation is already on its way
let isLoopRunning = false;

// Train one generation, report it and queue the next one
function trainNextGeneration(): void {
    // Stop the loop while paused
    if (training === null || isPaused) {
        isLoopRunning = false;
        return;
    }

    // Train a generation and report how it went
    const result = trainGeneration(training);
    const { kept, generation } = result.training;
    const report: GenerationReport = {
        newKept: kept === training.kept ? null : kept,
        bestScore: result.bestScore,
        generation,
        averageScore: result.averageScore,
    };
    training = result.training;
    self.postMessage(report);

    // Queue the next generation
    loopChannel.port2.postMessage(null);
}

// Start training generations
function startLoop(): void {
    if (isLoopRunning) return;
    isLoopRunning = true;
    loopChannel.port2.postMessage(null);
}

// Train a generation each time the loop channel delivers
loopChannel.port1.onmessage = trainNextGeneration;

// Follow the page's orders
self.onmessage = (e: MessageEvent<TrainingCommand>) => {
    const command = e.data;
    switch (command.type) {
        case 'start':
            training = createTraining(command.settings, command.seeds);
            startLoop();
            break;
        case 'pause':
            isPaused = true;
            break;
        case 'resume':
            isPaused = false;
            startLoop();
            break;
    }
};
