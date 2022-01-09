import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [something, setSomething] = useState({a: 1});

  return (
    <>
      <button onClick={() => setSomething({a: 1})}>change</button>

      <br /><br /><br />
    </>
  );
}

App.whyDidYouRender = true;
export default App;
