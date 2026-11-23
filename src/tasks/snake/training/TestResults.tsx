import StatNumber from '../../../components/StatNumber';
import type { GameResults } from '../board/useSnakeLoop';

interface TestResultsProps {
    results: GameResults;
}

function TestResults({ results }: TestResultsProps) {
    const { appleCount, gamesPlayed } = results;
    if (gamesPlayed === 0) return null;

    // Average apples per game, and the word for the game count
    const average = (appleCount / gamesPlayed).toFixed(1);
    const gameWord = gamesPlayed === 1 ? 'game' : 'games';

    return (
        <span>
            Average <StatNumber>{average}</StatNumber> · {gamesPlayed} {gameWord}
        </span>
    );
}

export default TestResults;
