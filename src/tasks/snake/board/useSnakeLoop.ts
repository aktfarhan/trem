import { stepSnakeGame } from '../step';
import { useCallback, useEffect, useState } from 'react';
import { createSnakeGame, type SnakeState } from '../game';
import { pickRandomSeed } from '../../../lib/seeded-random';
import type { SnakeAction } from '../direction';

// Picks the next move in a game
export type ChooseAction = (state: SnakeState) => SnakeAction;

// What moves the snake, or null to hold it still
interface UseSnakeLoopParams {
    chooseAction: ChooseAction | null;
}

// Game on the board, and a way to start a fresh one
export type UseSnakeLoopResult = ReturnType<typeof useSnakeLoop>;

// Time between moves
const MOVE_INTERVAL_MS = 75;

// Pause on a finished game before next one starts
const RESTART_DELAY_MS = 500;

// Start a game with a random seed
function startRandomGame(): SnakeState {
    return createSnakeGame(pickRandomSeed());
}

// Plays snake on the board, one move per interval
export function useSnakeLoop({ chooseAction }: UseSnakeLoopParams) {
    // ----- Data/Derived State -----

    // Game currently on the board
    const [game, setGame] = useState(() => startRandomGame());

    // ----- Action Handlers -----

    // Put a fresh game on the board
    const restart = useCallback(() => {
        setGame(startRandomGame());
    }, []);

    // ----- Effects -----

    // Move the snake once per interval while the game runs and a player is set
    useEffect(() => {
        if (game.endReason !== null || chooseAction === null) return;
        const intervalId = setInterval(() => {
            setGame((prev) => stepSnakeGame(prev, chooseAction(prev)));
        }, MOVE_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [game.endReason, chooseAction]);

    // Start a new game after the current one ends
    useEffect(() => {
        if (game.endReason === null) return;
        const timeoutId = setTimeout(restart, RESTART_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, [game.endReason, restart]);

    // ----- Export -----

    return { data: { game }, actions: { restart } };
}
