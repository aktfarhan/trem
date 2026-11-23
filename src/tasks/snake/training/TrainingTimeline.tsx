import StatNumber from '../../../components/StatNumber';
import type { TrainingSettings } from '../train';
import type { TrainingStatus } from './useSnakeTraining';

interface TrainingTimelineProps {
    score: number;
    status: TrainingStatus;
    settings: TrainingSettings | null;
    generation: number;
}

function TrainingTimeline({ score, status, settings, generation }: TrainingTimelineProps) {
    // Words before the score
    const describeRun = () => {
        if (!settings) return 'Your training timeline';
        const grid = `${settings.gridSize} × ${settings.gridSize}`;
        if (status === 'done') return `Final model · Generation ${generation} · ${grid}`;
        return `Live · Generation ${generation} of ${settings.generationCount} · ${grid}`;
    };
    const runText = describeRun();

    return (
        <div className="pt-3">
            <div className="flex h-5 items-center justify-between text-13 text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                    {settings && <span className="size-1.75 rounded-full bg-apple" />}
                    {runText}
                </span>
                <span>
                    Score <StatNumber>{score}</StatNumber>
                </span>
            </div>
            <div className="h-timeline" />
        </div>
    );
}

export default TrainingTimeline;
