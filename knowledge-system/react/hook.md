# hook

为什么使用 hook ？因为类组件有以下缺点：
* 在组件之间复用状态逻辑很难
* 复杂组件变得难以理解
* 难以理解的 class 语法

## hook api

* useState

    ```js
        const [state, setState] = useState(initialState)
    ```

    * useState 有一个参数可以为任意数据类型，作为默认值
    * useState 返回值为一个数组，数组的第一个参数为 state，第二个参数为一个改变 state 的函数（功能和 this.setState 一样）
    * hook 的 setState 更新 state 和类组件的 this.setState 不一样，hook setState 会替换值，而 this.setState 会合并值

    ```js
        import React, { useState } from 'react';
        function Example() {
            const [count, setCount] = useState(0);
            return (
                <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>Click me</button>
                </div>
            );
        }
        export default Example;
    ```

* useEffect
    ```js
        useEffect(fn, array)
    ```
    * Effect Hook 可以让你在函数组件中执行副作用操作（数据获取，设置订阅以及手动更改 React 组件中的 DOM 都属于副作用）
    * 可以把 useEffect Hook 看做 componentDidMount componentDidUpdate 和 componentWillUnmount 这三个函数的组合
    * useEffect 实现 componentDidMount。如果第二个参数为空数组，useEffect 相当于类组件里面 componentDidMount
    ```js
        import React, { useState, useEffect } from 'react';
        function Example() {
            const [count, setCount] = useState(0);
            useEffect(() => {
                console.log('我只会在组件初次挂载完成后执行');
            }, []);

            return (
                <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>Click me</button>
                </div>
            );
        }
        export default Example;
    ```
    * useEffect 实现 componentDidUpdate。如果不传第二个参数，useEffect 会在初次渲染和每次更新时，都会执行
    ```js
        import React, { useState, useEffect } from "react";
        function Example() {
            const [count, setCount] = useState(0);
            useEffect(() => {
                console.log('我会在初次组件挂载完成后以及重新渲染时执行');
            });
            return (
                <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>Click me</button>
                </div>
            );
        }
    ```
    * useEffect 实现 componentWillUnmount。useEffect 返回一个函数，React 将会在执行清除操作时调用它。每一次更新 state 触发 Effect hook，都会先调用返回的清除操作函数，然后再调用下一轮的 Effect hook。这是因为先要清除上一轮的 Effect。
    ```js
        useEffect(() => {
            console.log("订阅一些事件");
            return () => {
                console.log("执行清除操作")
            }
        });
    ```
    * useEffect 的第二个参数是 Effect 所依赖的值组成的数组。如果传递空数组，那么只在渲染后执行一次；如果传递的数组有多个子元素，则只要有一个改变，Effect hook 就会被触发。
    * 在函数组件中声明多个 Effect，则会按照声明的顺序依次调用。
    * useEffect 本身不支持异步写法（async await）,可以使用下面两种方法使其支持：
    ```js
        function App() {
            useEffect(() => {
                (async () => {
                    await getData();
                })();
            });
        }

        function App() {
            useEffect(() => {
                const getDataTemp = async () => {
                    await getData();
                }
                getDataTemp();
            });
        }
    ```

* useContext
    ```js
        const value = useContext(MyContext);
    ```
    * 接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。当组件上层最近的 MyContext.Provider 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值。即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 useContext 时重新渲染。其实 useContext 就是用于在函数组件中获取 context 对象的值。
    ```js
        // index.js
        import React from "react";
        import ReactDOM from "react-dom";
        import App from "./App";
        // 创建两个context
        export const UserContext = React.createContext();
        export const TokenContext = React.createContext();
        ReactDOM.render(
            <UserContext.Provider value={{ id: 1, name: "chimmy", age: "20" }}>
                <TokenContext.Provider value="我是token">
                <App />
                </TokenContext.Provider>
            </UserContext.Provider>,
            document.getElementById("root")
        );

        // app.js
        import React, { useContext } from "react";
        import { UserContext, TokenContext } from "./index";

        function Example() {
            let user = useContext(UserContext);
            let token = useContext(TokenContext);
            console.log("UserContext", user);
            console.log("TokenContext", token);
            return (
                <div>
                    name:{user?.name},age:{user?.age}
                </div>
            );
        }
        export default Example;
    ```
    * useContext(MyContext) 相当于 class 组件中的 static contextType = MyContext 或者 MyContext.Consumer。useContext(MyContext) 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 MyContext.Provider 来为下层组件提供 context

* useReducer
    ```js
        const [state, dispatch] = useReducer(reducer, initialArg, init);
    ```
    * useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。
    ```js
        import React, { useReducer } from "react";
        export default function Home() {
            function reducer(state, action) {
                switch (action.type) {
                case "increment":
                    return { ...state, counter: state.counter + 1 };
                case "decrement":
                    return { ...state, counter: state.counter - 1 };
                default:
                    return state;
                }
            }
            const [state, dispatch] = useReducer(reducer, { counter: 0 });
            return (
                <div>
                <h2>Home当前计数: {state.counter}</h2>
                <button onClick={(e) => dispatch({ type: "increment" })}>+1</button>
                <button onClick={(e) => dispatch({ type: "decrement" })}>-1</button>
                </div>
            );
        }
    ```