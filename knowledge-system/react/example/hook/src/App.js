import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('mount 后或 update 后会执行');
    return () => {
      console.log('执行清除操作')
    }
  });

  return (
    <div className="App">
      <button onClick={() => setCount(count + 1)}>点击加一</button>
    </div>
  );
}

export default App;
