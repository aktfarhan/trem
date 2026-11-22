import clsx from 'clsx';
import type { ReactNode } from 'react';

// Label text
interface TagProps {
    children: ReactNode;
    isCompact?: boolean;
}

function Tag({ children, isCompact = false }: TagProps) {
    return (
        <span
            className={clsx(
                'rounded-md bg-surface text-ink-muted',
                isCompact ? 'px-1.75 py-0.25 text-11' : 'px-2.25 py-0.75 text-xs',
            )}
        >
            {children}
        </span>
    );
}

export default Tag;
