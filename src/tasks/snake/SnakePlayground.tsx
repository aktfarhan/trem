import { fitBoard } from './board/fit';
import { chooseBotAction } from './bot';
import TestBar from './training/TestBar';
import { DEFAULT_GRID_SIZE } from './game';
import { chooseModelAction } from './model';
import SnakeBoard from './board/SnakeBoard';
import { TEST_SET_SEEDS } from './test-set';
import { DEFAULT_TRAINING_SETTINGS } from './train';
import TrainingHeader from './training/TrainingHeader';
import { pickRandomSeed } from '../../lib/seeded-random';
import TrainingTimeline from './training/TrainingTimeline';
import { useElementSize } from '../../hooks/useElementSize';
import { useSnakeTesting } from './training/useSnakeTesting';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSnakeTraining } from './training/useSnakeTraining';
import { useSnakeLoop, type ChooseAction } from './board/useSnakeLoop';

function SnakePlayground() {
    // Middle column's free space, header and footer
    const stageRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const stage = useElementSize({ ref: stageRef });
    const header = useElementSize({ ref: headerRef });
    const footer = useElementSize({ ref: footerRef });

    // Board that fits the space the header and footer leave
    const reservedHeight = header.height + footer.height;
    const { boardSize, wrapWidth } = fitBoard(stage.width, stage.height, reservedHeight);

    // Whether the board plays the test set
    const [isTesting, setIsTesting] = useState(false);

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
    const { game, results } = loop.data;
    const { restart } = loop.actions;

    // Test games left
    const testing = useSnakeTesting();
    const { progress } = testing.data;
    const isSkipping = testing.state.status === 'testing';
    const { stop: stopTesting, start: startTesting } = testing.actions;

    // Test games so far
    const testResults = progress ?? results;

    // Generation the run has reached
    const generation = report?.generation ?? 0;

    // Start a run from new seeds
    const handleStart = useCallback(() => {
        const seeds = { worldSeed: pickRandomSeed(), trainingSeed: pickRandomSeed() };
        start(DEFAULT_TRAINING_SETTINGS, seeds);
        restart();
    }, [start, restart]);

    // Play the test set's games in order
    const handleTest = useCallback(() => {
        setIsTesting(true);
        restart(TEST_SET_SEEDS);
    }, [restart]);

    // Play the test games left in the background
    const handleSkip = useCallback(() => {
        if (!kept) return;
        startTesting(kept.model, DEFAULT_GRID_SIZE, results);
    }, [kept, results, startTesting]);

    // End the test, and go back to random games
    const handleDoneTesting = useCallback(() => {
        stopTesting();
        setIsTesting(false);
        restart();
    }, [stopTesting, restart]);

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
                            isTesting={isTesting}
                            hasKeptSnake={kept !== null}
                            onStop={stop}
                            onTest={handleTest}
                            onPause={pause}
                            onStart={handleStart}
                            onResume={resume}
                            onDoneTesting={handleDoneTesting}
                        />
                        <SnakeBoard size={boardSize} state={game} />
                        <div ref={footerRef}>
                            {isTesting ? (
                                <TestBar
                                    score={game.score}
                                    results={testResults}
                                    runNumber={runCount}
                                    isSkipping={isSkipping}
                                    onSkip={handleSkip}
                                />
                            ) : (
                                <TrainingTimeline
                                    score={game.score}
                                    status={status}
                                    settings={runSettings}
                                    generation={generation}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <aside className="w-100 shrink-0 hairline-l" />
        </div>
    );
}

export default SnakePlayground;
