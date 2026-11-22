import { useRef } from 'react';
import { fitBoard } from './board/fit';
import SnakeBoard from './board/SnakeBoard';
import { useSnakeLoop } from './board/useSnakeLoop';
import TrainingHeader from './training/TrainingHeader';
import TrainingTimeline from './training/TrainingTimeline';
import { useElementSize } from '../../hooks/useElementSize';

function SnakePlayground() {
    // Middle column's free space, header and the timeline
    const stageRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const stage = useElementSize({ ref: stageRef });
    const header = useElementSize({ ref: headerRef });
    const timeline = useElementSize({ ref: timelineRef });

    // Board that fits the space the header and timeline leave
    const reservedHeight = header.height + timeline.height;
    const { boardSize, wrapWidth } = fitBoard(stage.width, stage.height, reservedHeight);

    // Scripted player game
    const game = useSnakeLoop();

    return (
        <div className="flex min-h-0 flex-1">
            <aside className="w-80 shrink-0 hairline-r" />
            <main className="flex min-w-0 flex-1 flex-col px-7 py-5">
                <div ref={stageRef} className="flex min-h-0 flex-1 items-center justify-center">
                    <div style={{ width: wrapWidth }} className="flex flex-col">
                        <TrainingHeader ref={headerRef} />
                        <SnakeBoard size={boardSize} state={game} />
                        <TrainingTimeline ref={timelineRef} score={game.score} />
                    </div>
                </div>
            </main>
            <aside className="w-100 shrink-0 hairline-l" />
        </div>
    );
}

export default SnakePlayground;
