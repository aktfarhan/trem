import TestResults from './TestResults';
import { TEST_SET_SIZE } from '../test-set';
import StatNumber from '../../../components/StatNumber';
import ToolButton from '../../../components/ToolButton';
import { IconFlask, IconPlayerSkipForward } from '@tabler/icons-react';
import type { GameResults } from '../fitness';

interface TestBarProps {
    score: number;
    results: GameResults;
    runNumber: number;
    isSkipping: boolean;
    onSkip: () => void;
}

const ICON_SIZE = 12;

function TestBar({ score, results, runNumber, isSkipping, onSkip }: TestBarProps) {
    // Whether test games are left to play in the background
    const canSkip = !isSkipping && results.gamesPlayed < TEST_SET_SIZE;

    return (
        <div className="pt-3">
            <div className="flex h-5 items-center justify-between text-13 text-ink-muted">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-surface px-2 py-0.5 text-xs text-warning">
                    <IconFlask size={ICON_SIZE} aria-hidden />
                    Testing Run {runNumber}
                </span>
                <span className="inline-flex gap-3.5">
                    <TestResults results={results} isSkipping={isSkipping} />
                    <span>
                        Score <StatNumber>{score}</StatNumber>
                    </span>
                </span>
            </div>
            <div className="mt-2.5 flex h-7.5 items-center justify-end">
                <ToolButton icon={IconPlayerSkipForward} isDisabled={!canSkip} onClick={onSkip}>
                    Skip
                </ToolButton>
            </div>
        </div>
    );
}

export default TestBar;
