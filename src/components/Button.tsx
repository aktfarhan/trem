import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { TablerIcon } from '@tabler/icons-react';

// Small button as plain or primary
interface ButtonProps {
    icon?: TablerIcon;
    children: ReactNode;
    isPrimary?: boolean;
    onClick: () => void;
}

const ICON_SIZE = 13;

function Button({ icon: Icon, children, isPrimary = false, onClick }: ButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5',
                'text-13 whitespace-nowrap transition',
                isPrimary
                    ? 'bg-ink text-page hairline-transparent hover:opacity-88'
                    : 'text-ink hairline-strong hover:bg-surface',
            )}
        >
            {Icon && <Icon size={ICON_SIZE} aria-hidden />}
            {children}
        </button>
    );
}

export default Button;
