import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

export const UserContext = React.createContext();
export const TokenContext = React.createContext();


function Root() {
  const [user, setUser] = useState({ id: 1, name: 'chimmy', age: 20 });
  const [token, setToken] = useState('我是token');

  function toggleUser() {
    setUser(prevUser => ({
      ...prevUser,
      id: prevUser.id++,
      age: prevUser.age++
    }));
  }

  function toggleToken() {
    setToken(prevToken => prevToken === '我是token' ? '你好' : '我是token');
  }

  return (
    <UserContext.Provider value={{user, toggleUser}}>
      <TokenContext.Provider value={{token, toggleToken}}>
        <App />
      </TokenContext.Provider>
    </UserContext.Provider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
