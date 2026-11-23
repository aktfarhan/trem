import RunTitle from './RunTitle';
import RunStatus from './RunStatus';
import Button from '../../../components/Button';
import ScriptedPlayerTitle from './ScriptedPlayerTitle';
import {
    IconCheck,
    IconFlask,
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerStop,
} from '@tabler/icons-react';
import type { Ref } from 'react';
import type { TrainingStatus } from './useSnakeTraining';

interface TrainingHeaderProps {
    ref: Ref<HTMLDivElement>;
    status: TrainingStatus;
    runCount: number;
    isTesting: boolean;
    hasKeptSnake: boolean;
    onStop: () => void;
    onTest: () => void;
    onPause: () => void;
    onStart: () => void;
    onResume: () => void;
    onDoneTesting: () => void;
}

function TrainingHeader({
    ref,
    status,
    runCount,
    isTesting,
    hasKeptSnake,
    onStop,
    onTest,
    onPause,
    onStart,
    onResume,
    onDoneTesting,
}: TrainingHeaderProps) {
    // Whether a run is training or paused
    const isLive = status === 'training' || status === 'paused';

    // Whether the kept snake can be tested
    const showTest = hasKeptSnake && !isLive && !isTesting;

    // Whether a new run can start
    const showStart = !isLive && !isTesting;

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
                    {status !== 'idle' && <RunStatus status={isTesting ? 'testing' : status} />}
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
                    {showTest && (
                        <Button icon={IconFlask} onClick={onTest}>
                            Test
                        </Button>
                    )}
                    {isTesting && (
                        <Button icon={IconCheck} onClick={onDoneTesting}>
                            Done testing
                        </Button>
                    )}
                    {showStart && (
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
