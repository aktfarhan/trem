import TestResults from './TestResults';
import { IconFlask } from '@tabler/icons-react';
import StatNumber from '../../../components/StatNumber';
import type { GameResults } from '../board/useSnakeLoop';

interface TestBarProps {
    score: number;
    results: GameResults;
    runNumber: number;
}

const ICON_SIZE = 12;

function TestBar({ score, results, runNumber }: TestBarProps) {
    return (
        <div className="pt-3">
            <div className="flex h-5 items-center justify-between text-13 text-ink-muted">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-surface px-2 py-0.5 text-xs text-warning">
                    <IconFlask size={ICON_SIZE} aria-hidden />
                    Testing Run {runNumber}
                </span>
                <span className="inline-flex gap-3.5">
                    <TestResults results={results} />
                    <span>
                        Score <StatNumber>{score}</StatNumber>
                    </span>
                </span>
            </div>
            <div className="mt-2.5 h-7.5" />
        </div>
    );
}

export default TestBar;
