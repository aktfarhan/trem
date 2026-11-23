import { stepSnakeGame } from '../step';
import { createSnakeGame, type SnakeState } from '../game';
import { pickRandomSeed } from '../../../lib/seeded-random';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SnakeAction } from '../direction';

// Picks the next move in a game
export type ChooseAction = (state: SnakeState) => SnakeAction;

// What moves the snake, or null to hold it still
interface UseSnakeLoopParams {
    chooseAction: ChooseAction | null;
}

// Finished games and the apples eaten
export interface GameResults {
    appleCount: number;
    gamesPlayed: number;
}

// Game on the board, its finished games, and a way to start fresh ones
export type UseSnakeLoopResult = ReturnType<typeof useSnakeLoop>;

// Time between moves
const MOVE_INTERVAL_MS = 75;

// Pause on a finished game before next one starts
const RESTART_DELAY_MS = 500;

// Results before any game finishes
const NO_RESULTS: GameResults = { appleCount: 0, gamesPlayed: 0 };

// Start a game from the seed at its place in order, or a random seed
function startGame(seeds: number[] | null, gameIndex: number): SnakeState {
    return createSnakeGame(seeds ? seeds[gameIndex] : pickRandomSeed());
}

// Plays snake on the board, one move per interval
export function useSnakeLoop({ chooseAction }: UseSnakeLoopParams) {
    // ----- Data/Derived State -----

    // Seeds to play in order, or null for random games
    const [seeds, setSeeds] = useState<number[] | null>(null);

    // Game currently on the board
    const [game, setGame] = useState(() => startGame(null, 0));

    // Games finished before the current one
    const [pastResults, setPastResults] = useState(NO_RESULTS);

    // Finished games, counting the current one once it ends
    const results = useMemo((): GameResults => {
        if (game.endReason === null) return pastResults;
        return {
            appleCount: pastResults.appleCount + game.score,
            gamesPlayed: pastResults.gamesPlayed + 1,
        };
    }, [game.endReason, game.score, pastResults]);

    // Whether every seed has been played
    const isOutOfSeeds = seeds !== null && results.gamesPlayed >= seeds.length;

    // ----- Action Handlers -----

    // Start fresh games from these seeds in order
    const restart = useCallback((nextSeeds: number[] | null = null) => {
        setSeeds(nextSeeds);
        setPastResults(NO_RESULTS);
        setGame(startGame(nextSeeds, 0));
    }, []);

    // Start the next game, keeping the finished ones' results
    const startNextGame = useCallback(() => {
        setPastResults(results);
        setGame(startGame(seeds, results.gamesPlayed));
    }, [seeds, results]);

    // ----- Effects -----

    // Move the snake once per interval while the game runs and a player is set
    useEffect(() => {
        if (game.endReason !== null || chooseAction === null) return;
        const intervalId = setInterval(() => {
            setGame((prev) => stepSnakeGame(prev, chooseAction(prev)));
        }, MOVE_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [game.endReason, chooseAction]);

    // Start the next game after the current one ends
    useEffect(() => {
        if (game.endReason === null || isOutOfSeeds) return;
        const timeoutId = setTimeout(startNextGame, RESTART_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, [game.endReason, isOutOfSeeds, startNextGame]);

    // ----- Export -----

    return { data: { game, results }, actions: { restart } };
}
