import { TEST_SET_SIZE } from '../test-set';
import StatNumber from '../../../components/StatNumber';
import type { GameResults } from '../fitness';

interface TestResultsProps {
    results: GameResults;
    isSkipping: boolean;
}

// Writes counts with commas
const COUNT_FORMAT = new Intl.NumberFormat('en-US');

// Games in the test set
const TEST_SET_COUNT = COUNT_FORMAT.format(TEST_SET_SIZE);

function TestResults({ results, isSkipping }: TestResultsProps) {
    // Games played so far
    const { appleCount, gamesPlayed } = results;
    const gameCount = COUNT_FORMAT.format(gamesPlayed);

    // Show how far the background test has reached
    if (isSkipping) {
        return (
            <span>
                Skipping… <StatNumber>{gameCount}</StatNumber> of {TEST_SET_COUNT} games
            </span>
        );
    }
    if (gamesPlayed === 0) return null;

    // Average apples per game, and the word for the game count
    const average = (appleCount / gamesPlayed).toFixed(1);
    const gameWord = gamesPlayed === 1 ? 'game' : 'games';

    return (
        <span>
            Average <StatNumber>{average}</StatNumber> · {gameCount} {gameWord}
        </span>
    );
}

export default TestResults;
