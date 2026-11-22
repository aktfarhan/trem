function ScriptedPlayerTitle() {
    return (
        <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
                <span className="text-17 leading-title font-semibold">Scripted player</span>
                <span className="rounded-md bg-surface px-1.75 py-0.25 text-11 text-ink-muted">
                    Fixed rules
                </span>
            </div>
            <span className="truncate text-xs leading-subtitle text-ink-muted">
                No runs yet. Train a model to beat it.
            </span>
        </div>
    );
}

export default ScriptedPlayerTitle;
