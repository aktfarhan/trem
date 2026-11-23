import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { TablerIcon } from '@tabler/icons-react';

interface ToolButtonProps {
    icon: TablerIcon;
    children: ReactNode;
    isDisabled?: boolean;
    onClick: () => void;
}

const ICON_SIZE = 14;

function ToolButton({ icon: Icon, children, isDisabled = false, onClick }: ToolButtonProps) {
    return (
        <button
            type="button"
            disabled={isDisabled}
            onClick={onClick}
            className={clsx(
                'inline-flex h-6.5 cursor-pointer items-center gap-1.5 rounded-md px-2.5',
                'text-xs text-ink-muted hairline',
                'enabled:hover:text-ink enabled:hover:hairline-strong',
                'disabled:cursor-default disabled:opacity-60',
            )}
        >
            <Icon size={ICON_SIZE} aria-hidden />
            {children}
        </button>
    );
}

export default ToolButton;
