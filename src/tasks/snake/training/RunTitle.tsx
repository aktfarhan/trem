import clsx from 'clsx';
import Tag from '../../../components/Tag';

// Which run it is
interface RunTitleProps {
    runNumber: number;
}

// Color for each run, resetting after the fifth
const RUN_COLOR_CLASSES = ['bg-run-1', 'bg-run-2', 'bg-run-3', 'bg-run-4', 'bg-run-5'];

function RunTitle({ runNumber }: RunTitleProps) {
    // Color for this run
    const colorClass = RUN_COLOR_CLASSES[(runNumber - 1) % RUN_COLOR_CLASSES.length];

    return (
        <>
            <span className="mr-1 inline-flex items-center gap-2 text-17 font-semibold">
                <span className={clsx('size-2.5 rounded-color-square', colorClass)} />
                Run {runNumber}
            </span>
            <Tag>Evolution</Tag>
        </>
    );
}

export default RunTitle;
