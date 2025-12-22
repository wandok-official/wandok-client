import { useStore } from './stores/useCounterStore';
import './index.css';

function App() {
  const { count, inc } = useStore();

  return (
    <>
      <h1 className="underline">Hello Wandok!</h1>

      <div>
        <span>{count}</span>
        <button onClick={inc} className="bg-blue-300 ml-2">one up</button>
      </div>
    </>
  );
}

export default App;
