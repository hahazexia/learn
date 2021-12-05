import './App.css';
import React, { useEffect, useState, useContext } from 'react';
import { UserContext, TokenContext } from "./index";
import Dialog from './Dialog'

function App() {
  const [count, setCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  console.log('App 重新渲染了')

  useEffect(() => {
    console.log('mount 后或 update 后会执行');
    return () => {
      console.log('执行清除操作')
    }
  });

  return (
    <div className="App">
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>点击加一</button>
      <button onClick={() => setOpenDialog(true)}>打开 dialog</button>
      <ExampleMemo />
      {Dialog({show: openDialog, onClose: () => setOpenDialog(false)})}
    </div>
  );
}

function Example() {
  let { user, toggleUser } = useContext(UserContext);
  let { token, toggleToken } = useContext(TokenContext);
  console.log('Example 重新渲染了')
  return (
    <div>
      id:{user?.id},name:{user?.name},age:{user?.age} <br />
      {token} <br />
      <button onClick={toggleUser}>toggleUser 按钮</button>
      <button onClick={toggleToken}>toggleToken</button>
    </div>
  );
}
// Example 组件接收上层 context.provider 传递的数据显示，数据不变不需要重新渲染，而 App 组件内点击按钮后会触发 state 改变造成 Example 组件也重新渲染，所以将 Example 组件用 React.memo 包裹缓存，避免不需要的重新渲染。
const ExampleMemo = React.memo(Example);

export default App;

