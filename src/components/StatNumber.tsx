import type { ReactNode } from 'react';

interface StatNumberProps {
    children: ReactNode;
}

function StatNumber({ children }: StatNumberProps) {
    return <b className="font-semibold text-ink tabular-nums">{children}</b>;
}

export default StatNumber;
