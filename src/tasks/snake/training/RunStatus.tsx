import clsx from 'clsx';
import type { TrainingStatus } from './useSnakeTraining';

// Where a run stands once it has started, or during testing
type RunState = Exclude<TrainingStatus, 'idle'> | 'testing';

// Where the current run stands
interface RunStatusProps {
    status: RunState;
}

// Word for each state
const STATUS_LABELS: Record<RunState, string> = {
    done: 'Done',
    failed: 'Failed',
    paused: 'Paused',
    stopped: 'Stopped',
    testing: 'Testing',
    training: 'Training',
};

function RunStatus({ status }: RunStatusProps) {
    return (
        <span className="mr-1.5 inline-flex items-center gap-1.5 text-13 text-ink-muted">
            <span
                className={clsx(
                    'size-1.75 rounded-full',
                    status === 'training' ? 'bg-snake' : 'bg-ink-faint',
                )}
            />
            {STATUS_LABELS[status]}
        </span>
    );
}

export default RunStatus;
