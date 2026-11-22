import { fitBoard } from './board/fit';
import { chooseBotAction } from './bot';
import { chooseModelAction } from './model';
import SnakeBoard from './board/SnakeBoard';
import { DEFAULT_TRAINING_SETTINGS } from './train';
import { useCallback, useMemo, useRef } from 'react';
import TrainingHeader from './training/TrainingHeader';
import { pickRandomSeed } from '../../lib/seeded-random';
import TrainingTimeline from './training/TrainingTimeline';
import { useElementSize } from '../../hooks/useElementSize';
import { useSnakeTraining } from './training/useSnakeTraining';
import { useSnakeLoop, type ChooseAction } from './board/useSnakeLoop';

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

    // Training in the background, and its latest results
    const training = useSnakeTraining();
    const { status } = training.state;
    const { kept, report, runCount, runSettings } = training.data;
    const { stop, pause, start, resume } = training.actions;

    // Moves on the board
    const chooseAction = useMemo((): ChooseAction | null => {
        if (runCount === 0) return chooseBotAction;
        if (!kept) return null;
        return (game) => chooseModelAction(game, kept.model);
    }, [runCount, kept]);

    // Game on the board
    const loop = useSnakeLoop({ chooseAction });
    const { game } = loop.data;
    const { restart } = loop.actions;

    // Generation the run has reached
    const generation = report?.generation ?? 0;

    // Start a run from new seeds
    const handleStart = useCallback(() => {
        const seeds = { worldSeed: pickRandomSeed(), trainingSeed: pickRandomSeed() };
        start(DEFAULT_TRAINING_SETTINGS, seeds);
        restart();
    }, [start, restart]);

    return (
        <div className="flex min-h-0 flex-1">
            <aside className="w-80 shrink-0 hairline-r" />
            <main className="flex min-w-0 flex-1 flex-col px-7 py-5">
                <div ref={stageRef} className="flex min-h-0 flex-1 items-center justify-center">
                    <div style={{ width: wrapWidth }} className="flex flex-col">
                        <TrainingHeader
                            ref={headerRef}
                            status={status}
                            runCount={runCount}
                            onStop={stop}
                            onPause={pause}
                            onStart={handleStart}
                            onResume={resume}
                        />
                        <SnakeBoard size={boardSize} state={game} />
                        <TrainingTimeline
                            ref={timelineRef}
                            score={game.score}
                            status={status}
                            settings={runSettings}
                            generation={generation}
                        />
                    </div>
                </div>
            </main>
            <aside className="w-100 shrink-0 hairline-l" />
        </div>
    );
}

export default SnakePlayground;
