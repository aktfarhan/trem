import tremMark from '../assets/trem-mark.svg';

function TopBar() {
    return (
        <header className="box-content flex h-13 shrink-0 items-center px-6 hairline-b">
            <div className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
                <img src={tremMark} alt="" className="size-5" />
                trem
            </div>
        </header>
    );
}

export default TopBar;
