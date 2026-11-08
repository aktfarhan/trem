import { TEST_SET_SIZE, type TestProgress } from '../test-set';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SnakeModel } from '../model';
import type { TestOrder } from '../test.worker';

// Where a test run stands
type TestingStatus = 'idle' | 'testing' | 'done' | 'failed';

// Testing state, progress and actions
export type UseSnakeTestingResult = ReturnType<typeof useSnakeTesting>;

// Start a worker that tests in the background
function startTestWorker(): Worker {
    return new Worker(new URL('../test.worker.ts', import.meta.url), { type: 'module' });
}

// Tests a snake on the test set
export function useSnakeTesting() {
    // ----- UI State -----

    // Where the test run stands
    const [status, setStatus] = useState<TestingStatus>('idle');

    // ----- Refs -----

    // Worker running the current test
    const workerRef = useRef<Worker | null>(null);

    // ----- Data/Derived State -----

    // Games played so far and their average apples
    const [progress, setProgress] = useState<TestProgress | null>(null);

    // ----- Action Handlers -----

    // Shut down the running worker
    const shutDownWorker = useCallback(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    // Start a test in a fresh worker
    const start = useCallback(
        (model: SnakeModel, gridSize: number) => {
            shutDownWorker();
            const worker = startTestWorker();

            // Keep each game's progress
            worker.onmessage = (e: MessageEvent<TestProgress>) => {
                setProgress(e.data);
                if (e.data.gamesPlayed < TEST_SET_SIZE) return;
                shutDownWorker();
                setStatus('done');
            };

            // Stop on a crash
            worker.onerror = (e) => {
                console.error('Snake test worker failed:', e.message);
                shutDownWorker();
                setStatus('failed');
            };

            // Start the test, and clear progress
            const order: TestOrder = { model, gridSize };
            worker.postMessage(order);
            workerRef.current = worker;
            setProgress(null);
            setStatus('testing');
        },
        [shutDownWorker],
    );

    // End the test
    const stop = useCallback(() => {
        shutDownWorker();
        setProgress(null);
        setStatus('idle');
    }, [shutDownWorker]);

    // ----- Effects -----

    // Shut down the worker when the page leaves
    useEffect(() => {
        return shutDownWorker;
    }, [shutDownWorker]);

    // ----- Export -----

    return { state: { status }, data: { progress }, actions: { stop, start } };
}
