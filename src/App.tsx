import TopBar from './components/TopBar';
import SnakePlayground from './tasks/snake/SnakePlayground';

function App() {
    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-page text-ink antialiased">
            <TopBar />
            <SnakePlayground />
        </div>
    );
}

export default App;
