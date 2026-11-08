import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeptSnake, RunSeeds, TrainingSettings } from '../train';
import type { GenerationReport, TrainingCommand } from '../train.worker';

// Where a training stands
type TrainingStatus = 'idle' | 'training' | 'paused' | 'stopped' | 'failed';

// Training state, data, actions
export type UseSnakeTrainingResult = ReturnType<typeof useSnakeTraining>;

// Start a worker that trains in the background
function startTrainingWorker(): Worker {
    return new Worker(new URL('../train.worker.ts', import.meta.url), { type: 'module' });
}

// Send an order to the training worker
function sendCommand(worker: Worker, command: TrainingCommand): void {
    worker.postMessage(command);
}

// Trains snakes in a background worker
export function useSnakeTraining() {
    // ----- UI State -----

    // Where the training stands
    const [status, setStatus] = useState<TrainingStatus>('idle');

    // ----- Refs -----

    // Worker running the current training
    const workerRef = useRef<Worker | null>(null);

    // ----- Data/Derived State -----

    // Latest generation's report
    const [report, setReport] = useState<GenerationReport | null>(null);

    // Best snake kept so far
    const [kept, setKept] = useState<KeptSnake | null>(null);

    // ----- Action Handlers -----

    // Shut down the running worker
    const shutDownWorker = useCallback(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    // Start a new training in a fresh worker
    const start = useCallback(
        (settings: TrainingSettings, seeds: RunSeeds) => {
            shutDownWorker();
            const worker = startTrainingWorker();

            // Keep each report
            worker.onmessage = (e: MessageEvent<GenerationReport>) => {
                setReport(e.data);
                if (e.data.newKept) setKept(e.data.newKept);
            };

            // Stop on a crash
            worker.onerror = (e) => {
                console.error('Snake training worker failed:', e.message);
                shutDownWorker();
                setStatus('failed');
            };

            // Start training, and clear reports
            sendCommand(worker, { type: 'start', seeds, settings });
            workerRef.current = worker;
            setReport(null);
            setKept(null);
            setStatus('training');
        },
        [shutDownWorker],
    );

    // Pause after the current generation
    const pause = useCallback(() => {
        if (!workerRef.current) return;
        sendCommand(workerRef.current, { type: 'pause' });
        setStatus('paused');
    }, []);

    // Carry on from where the training paused
    const resume = useCallback(() => {
        if (!workerRef.current) return;
        sendCommand(workerRef.current, { type: 'resume' });
        setStatus('training');
    }, []);

    // End the training
    const stop = useCallback(() => {
        if (!workerRef.current) return;
        shutDownWorker();
        setStatus('stopped');
    }, [shutDownWorker]);

    // ----- Effects -----

    // Shut down the worker when the page leaves
    useEffect(() => {
        return shutDownWorker;
    }, [shutDownWorker]);

    // ----- Export -----

    return { state: { status }, data: { kept, report }, actions: { stop, pause, start, resume } };
}
