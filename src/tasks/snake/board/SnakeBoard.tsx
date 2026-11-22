import { drawSnakeGame } from './draw';
import { readBoardColors } from './colors';
import { useEffect, useMemo, useRef } from 'react';
import type { SnakeState } from '../game';

// Width and height of the board
interface SnakeBoardProps {
    size: number;
    state: SnakeState;
}

function SnakeBoard({ size, state }: SnakeBoardProps) {
    // Canvas the game is drawn on
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Board colors read once on mount
    const colors = useMemo(() => readBoardColors(), []);

    // Pixel density
    const pixelRatio = window.devicePixelRatio;

    // Width and height of the canvas
    const canvasSize = size * pixelRatio;

    // Redraw the board whenever the game changes
    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');
        if (!context) return;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawSnakeGame(context, state, colors, size);
    }, [state, colors, size, pixelRatio]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            role="img"
            aria-label="Snake game"
            style={{ width: size, height: size }}
            className="self-center rounded-lg hairline-ring"
        />
    );
}

export default SnakeBoard;
