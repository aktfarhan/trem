import { useRef } from 'react';
import { fitBoard } from './board/fit';
import SnakeBoard from './board/SnakeBoard';
import { useElementSize } from '../../hooks/useElementSize';

const RESERVED_HEIGHT = 143.5;

function SnakePlayground() {
    // Middle column's free space, and the board that fits it
    const stageRef = useRef<HTMLDivElement>(null);
    const stage = useElementSize({ ref: stageRef });
    const { boardSize, wrapWidth } = fitBoard(stage.width, stage.height, RESERVED_HEIGHT);

    return (
        <div className="flex min-h-0 flex-1">
            <aside className="w-80 shrink-0 hairline-r" />
            <main className="flex min-w-0 flex-1 flex-col px-7 py-5">
                <div ref={stageRef} className="flex min-h-0 flex-1 items-center justify-center">
                    <div style={{ width: wrapWidth }} className="flex flex-col">
                        <SnakeBoard size={boardSize} />
                    </div>
                </div>
            </main>
            <aside className="w-100 shrink-0 hairline-l" />
        </div>
    );
}

export default SnakePlayground;
