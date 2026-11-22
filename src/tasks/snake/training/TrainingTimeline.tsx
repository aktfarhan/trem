import type { Ref } from 'react';
import type { TrainingSettings } from '../train';
import type { TrainingStatus } from './useSnakeTraining';

interface TrainingTimelineProps {
    ref: Ref<HTMLDivElement>;
    score: number;
    status: TrainingStatus;
    settings: TrainingSettings | null;
    generation: number;
}

function TrainingTimeline({ ref, score, status, settings, generation }: TrainingTimelineProps) {
    // Words before the score
    const describeRun = () => {
        if (!settings) return 'Your training timeline';
        const grid = `${settings.gridSize} × ${settings.gridSize}`;
        if (status === 'done') return `Final model · Generation ${generation} · ${grid}`;
        return `Live · Generation ${generation} of ${settings.generationCount} · ${grid}`;
    };
    const runText = describeRun();

    return (
        <div ref={ref} className="pt-3">
            <div className="flex h-5 items-center justify-between text-13 text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                    {settings && <span className="size-1.75 rounded-full bg-apple" />}
                    {runText}
                </span>
                <span>
                    Score <b className="font-semibold text-ink tabular-nums">{score}</b>
                </span>
            </div>
            <div className="h-timeline" />
        </div>
    );
}

export default TrainingTimeline;
