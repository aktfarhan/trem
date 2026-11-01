import { drawSnakeGame } from './draw';
import { readBoardColors } from './colors';
import { useSnakeLoop } from './useSnakeLoop';
import { useEffect, useMemo, useRef } from 'react';

// Width and height of the board
const BOARD_SIZE = 480;

function SnakeBoard() {
    // Canvas the game is drawn on
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game the bot is playing
    const state = useSnakeLoop();

    // Board colors read once on mount
    const colors = useMemo(() => readBoardColors(), []);

    // Pixel density
    const pixelRatio = window.devicePixelRatio;

    // Width and height of the canvas
    const canvasSize = BOARD_SIZE * pixelRatio;

    // Redraw the board whenever the game changes
    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');
        if (!context) return;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawSnakeGame(context, state, colors, BOARD_SIZE);
    }, [state, colors, pixelRatio]);

    return (
        <div className="flex flex-col gap-3">
            <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                role="img"
                aria-label="Snake played by the scripted bot"
                className="size-120 rounded-lg ring ring-white/10"
            />
            <p className="text-right text-sm text-ink-muted">
                Score <span className="font-semibold text-ink">{state.score}</span>
            </p>
        </div>
    );
}

export default SnakeBoard;
