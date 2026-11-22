import Tag from '../../../components/Tag';

function ScriptedPlayerTitle() {
    return (
        <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
                <span className="text-17 leading-title font-semibold">Scripted player</span>
                <Tag isCompact>Fixed rules</Tag>
            </div>
            <span className="truncate text-xs leading-subtitle text-ink-muted">
                No runs yet. Train a model to beat it.
            </span>
        </div>
    );
}

export default ScriptedPlayerTitle;
