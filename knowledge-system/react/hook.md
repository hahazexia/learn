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

        // App.js
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

* useCallback
    ```js
        const memoizedCallback = useCallback(
            () => {
                doSomething(a, b);
            },
            [a, b],
        );
    ```
    * 返回一个 memoized 回调函数。把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如 shouldComponentUpdate）的子组件时，它将非常有用。
    ```js
        import React, { useState } from "react";
        // 子组件
        function Childs(props) {
            console.log("子组件渲染了");
            return (
                <>
                    <button onClick={props.onClick}>改标题</button>
                    <h1>{props.name}</h1>
                </>
            );
        }
        const Child = React.memo(Childs);
        function App() {
            const [title, setTitle] = useState("这是一个 title");
            const [subtitle, setSubtitle] = useState("我是一个副标题");
            const callback = () => {
                setTitle("标题改变了");
            };
            return (
                <div className="App">
                    <h1>{title}</h1>
                    <h2>{subtitle}</h2>
                    <button onClick={() => setSubtitle("副标题改变了")}>改副标题</button>
                    <Child onClick={callback} name="桃桃" />
                </div>
            );
        }

    ```
    上面这个例子，当点击 Childs 中的改标题按钮后，会触发 App 中传入的方法去修改 title 这个 state，这样会触发 App 组件重新渲染，但是又触发 Childs 组件重新渲染，但是 Childs 组件的内容并没有变化。

    * 一个组件重新重新渲染，一般三种情况：
        * 要么是组件自己的状态改变
        * 要么是父组件重新渲染，导致子组件重新渲染，但是父组件的 props 没有改变
        * 要么是父组件重新渲染，导致子组件重新渲染，但是父组件传递的 props 改变

    第一种很明显就排除了，当点击改副标题 的时候并没有去改变 Child 组件的状态；第二种情况，我们这个时候用 React.memo 来解决了这个问题，所以这种情况也排除。那么就是第三种情况了，当父组件重新渲染的时候，传递给子组件的 props 发生了改变，再看传递给 Child 组件的就两个属性，一个是 name，一个是 onClick ，name 是传递的常量，不会变，变的就是 onClick 了，为什么传递给 onClick 的 callback 函数会发生改变呢？其实在函数式组件里每次重新渲染，函数组件都会重头开始重新执行，那么这两次创建的 callback 函数肯定发生了改变，所以导致了子组件重新渲染。

    ```js
        const callback = () => { setTitle("标题改变了"); };
        // 通过 useCallback 进行记忆 callback，并将记忆的 callback 传递给 Child
        <Child onClick={useCallback(callback, [])} name="桃桃" />
    ```

* useMemo
    ```js
        const cacheSomething = useMemo(create, deps)
    ```
    * create：第一个参数为一个函数，函数的返回值作为缓存值。
    * deps： 第二个参数为一个数组，存放当前 useMemo 的依赖项，在函数组件下一次执行的时候，会对比 deps 依赖项里面的状态，是否有改变，如果有改变重新执行 create ，得到新的缓存值。
    * cacheSomething：返回值，执行 create 的返回值。如果 deps 中有依赖项改变，返回的重新执行 create 产生的值，否则取上一次缓存值。
    * useMemo 原理：useMemo 会记录上一次执行 create 的返回值，并把它绑定在函数组件对应的 fiber 对象上，只要组件不销毁，缓存值就一直存在，但是 deps 中如果有一项改变，就会重新执行 create ，返回值作为新的值记录到 fiber 对象上。
    ```js
        function Child() {
            console.log("子组件渲染了")
            return <div>Child</div> 
        }
        const Child = React.memo(Child)
        function APP() {
            const [count, setCount] = useState(0);
            const userInfo = {
                age: count,
                name: 'jimmy'
            }
            return <Child userInfo={userInfo}>
        }
    ```
    当函数组件重新 render 时，userInfo 每次都将是一个新的对象，无论 count 发生改变没，都会导致 Child 组件的重新渲染。
    ```js
        function Child() {
            console.log("子组件渲染了")
            return <div>Child</div> 
        }
        function APP() {
            const [count, setCount] = useState(0);
            // 只有 count 改变了才会返回新的对象
            const userInfo = useMemo(() => {
                return {
                    name: "jimmy",
                    age: count
                };
            }, [count]);
            return <Child userInfo={userInfo}>
        }
    ```

* useCallback 和 useMemo 总结
    * 简单理解 useCallback 与 useMemo 一个缓存的是函数，一个缓存的是函数的返回的结果。useCallback 是来优化子组件的，防止子组件的重复渲染。useMemo 可以优化当前组件也可以优化子组件，优化当前组件主要是通过 memoize 来将一些复杂的计算逻辑进行缓存。当然如果只是进行一些简单的计算也没必要使用 useMemo。我们可以将 useMemo 的返回值定义为返回一个函数这样就可以变通的实现了 useCallback。useCallback(fn, deps) 相当于 useMemo(() => fn, deps)

* useRef
    ```js
        const refContainer = useRef(initialValue);
    ```
    * useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变
    ```js
        import React, { useRef } from "react";
        function Example() {
            const divRef = useRef();
            function changeDOM() {
                // 获取整个div
                console.log("整个div", divRef.current);
                // 获取div的class
                console.log("div的class", divRef.current.className);
                // 获取div自定义属性
                console.log("div自定义属性", divRef.current.getAttribute("data-clj"));
            }
            return (
                <div>
                    <div className="div-class" data-clj="我是div的自定义属性" ref={divRef}>
                        我是div
                    </div>
                    <button onClick={(e) => changeDOM()}>获取DOM</button>
                </div>
            );
        }
        export default Example;

    ```
    * useRef 缓存数据。usestate 和 useReducer 保存的数据源一旦改变，就会重新渲染整个组件，所以这时候函数组件内部声明的变量，则下一次更新也会重置，因此可以使用 useRef 来缓存数据
    ```js
        import React, { useRef, useState, useEffect } from "react";
        function Example() {
            const [count, setCount] = useState(0);

            const numRef = useRef(count);

            useEffect(() => {
                numRef.current = count;
            }, [count]);

            return (
                <div>
                    <h2>count上一次的值: {numRef.current}</h2>
                    <h2>count这一次的值: {count}</h2>
                    <button onClick={(e) => setCount(count + 10)}>+10</button>
                </div>
            );
        }
        export default Example;

    ```
    当 ref 对象内容发生变化时，useRef 并不会通知你。变更 .current 属性不会引发组件重新渲染。所以，上面的例子中虽然numRef.current的值，已经改变了，但是页面上还是显示的上一次的值，重新更新时，才会显示上一次更新的值。
