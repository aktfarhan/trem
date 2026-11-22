import type { Ref } from 'react';

// Timeline element, with padding
interface TrainingTimelineProps {
    ref: Ref<HTMLDivElement>;
    score: number;
}

function TrainingTimeline({ ref, score }: TrainingTimelineProps) {
    return (
        <div ref={ref} className="pt-3">
            <div className="flex h-5 items-center justify-between text-13 text-ink-muted">
                <span>Your training timeline</span>
                <span>
                    Score <b className="font-semibold text-ink tabular-nums">{score}</b>
                </span>
            </div>
            <div className="h-timeline" />
        </div>
    );
}

export default TrainingTimeline;
