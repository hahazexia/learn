import './App.css';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Link to={'/form'}>去 From 页面</Link>
      </header>
    </div>
  );
}

export default App;
