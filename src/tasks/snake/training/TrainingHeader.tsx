import RunTitle from './RunTitle';
import RunStatus from './RunStatus';
import Button from '../../../components/Button';
import ScriptedPlayerTitle from './ScriptedPlayerTitle';
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import type { Ref } from 'react';
import type { TrainingStatus } from './useSnakeTraining';

interface TrainingHeaderProps {
    ref: Ref<HTMLDivElement>;
    status: TrainingStatus;
    runCount: number;
    onStop: () => void;
    onPause: () => void;
    onStart: () => void;
    onResume: () => void;
}

function TrainingHeader({
    ref,
    status,
    runCount,
    onStop,
    onPause,
    onStart,
    onResume,
}: TrainingHeaderProps) {
    // Whether a run is training or paused
    const isLive = status === 'training' || status === 'paused';

    // Label of the button that starts a run
    const startLabel = status === 'idle' ? 'Start run' : 'New run';

    return (
        <div ref={ref} className="pb-3.5">
            <div className="flex h-9 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
                    {status === 'idle' ? (
                        <ScriptedPlayerTitle />
                    ) : (
                        <RunTitle runNumber={runCount} />
                    )}
                </div>
                <div className="flex flex-none items-center gap-2">
                    {status !== 'idle' && <RunStatus status={status} />}
                    {status === 'training' && (
                        <Button icon={IconPlayerPause} onClick={onPause}>
                            Pause
                        </Button>
                    )}
                    {status === 'paused' && (
                        <Button icon={IconPlayerPlay} onClick={onResume}>
                            Resume
                        </Button>
                    )}
                    {isLive && (
                        <Button icon={IconPlayerStop} onClick={onStop}>
                            Stop
                        </Button>
                    )}
                    {!isLive && (
                        <Button icon={IconPlayerPlay} isPrimary onClick={onStart}>
                            {startLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrainingHeader;
