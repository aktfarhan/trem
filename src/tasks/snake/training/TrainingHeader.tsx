import ScriptedPlayerTitle from './ScriptedPlayerTitle';
import type { Ref } from 'react';

// Header element
interface TrainingHeaderProps {
    ref: Ref<HTMLDivElement>;
}

function TrainingHeader({ ref }: TrainingHeaderProps) {
    return (
        <div ref={ref} className="pb-3.5">
            <div className="flex h-9 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
                    <ScriptedPlayerTitle />
                </div>
            </div>
        </div>
    );
}

export default TrainingHeader;
