import { stepSnakeGame } from '../step';
import { chooseBotAction } from '../bot';
import { useEffect, useState } from 'react';
import { createSnakeGame, type SnakeState } from '../game';

// Time between moves
const MOVE_INTERVAL_MS = 75;

// Pause on a finished game before next one starts
const RESTART_DELAY_MS = 500;

// Number of different seeds
const SEED_RANGE = 2 ** 32;

// Start a game with a random seed
function startRandomGame(): SnakeState {
    return createSnakeGame(Math.floor(Math.random() * SEED_RANGE));
}

// Plays snake with the scripted bot
export function useSnakeLoop() {
    // Game currently on the board
    const [state, setState] = useState(() => startRandomGame());

    // Move the snake once per interval while the game is running
    useEffect(() => {
        if (state.endReason !== null) return;
        const intervalId = setInterval(() => {
            setState((prev) => stepSnakeGame(prev, chooseBotAction(prev)));
        }, MOVE_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [state.endReason]);

    // Start a new game after the current one ends
    useEffect(() => {
        if (state.endReason === null) return;
        const timeoutId = setTimeout(() => setState(startRandomGame()), RESTART_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, [state.endReason]);

    return state;
}
