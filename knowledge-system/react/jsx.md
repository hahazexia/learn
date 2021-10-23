# jsx

## 基础用法

```js
import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo512.png'
import style from './index.module.scss'

const name = 'React';
const obj = {
    firstName: 'Harry',
    lastName: 'Potter'
};

function formatName(obj) {
    return obj.firstName + obj.lastName
}

const greet = (<div>good</div>);
const show = true;
const arr = [1, 2, 3];

const jsx = (
    {/*这是一条注释*/}
    {
        //这是一条注释
    }
    <div className={style.app}>
        <div>Hello, {name}</div>
        <div>{formatName(obj)}</div>
        <div>{greet}</div>
        <div>{show ? greet : 'login'}</div>
        <div>{show && 'login'}</div>
        <ul>
            {arr.map((i, index) => <li key={index}>{i}</li>)}
        </ul>
        <img src={logo} alt="logo" className={style.logo} />
        <div style={{width: '50px', height: '50px', border: '1px solid #000'}}></div>
    </div>
);

ReactDOM.render(jsx, document.getElementById('root'));

// 基本使用，js 表达式用 {} 包含
// 函数
// jsx 对象
// 条件语句
// 数组
// 属性
// css 模块化 需要按照 sass 依赖，node-sass 依赖已经不更新了
```

## jsx 的原理

jsx 实际上仅仅是 React.createElement(type, config, children) 方法的语法糖，该方法接收三个参数：

* type，当前 ReactElement 的类型，如果是标签元素，那么使用字符串表示 div，如果是组件元素直接使用组件的名称就可以。
* config，我们在JSX中绑定的属性会在 config 对象中以键值对的形式存在。
* children，存放标签中的内容，以 children 数组的形式存储

jsx 是依赖 babel 解析的，[链接](https://babeljs.io/repl/#?presets=react)。

通过 React.createElement() 方法最后返回得到的是一个 ReactElement 对象，React 利用 ReactElement 对象组成了一个 JavaScript 对象树，这个对象树就是我们经常讲的一个概念虚拟 DOM，我们可以将之前 jsx 返回的结果进行打印来查看对应的 ReactElemnt 对象。对应的 ReactElement 对象树经过 ReactDOM.render() 方法转换为真正的 DOM 在我们的浏览器进行渲染。

为什么采用虚拟DOM呢？

* 很难跟踪状态发生的改变：原有的开发模式，我们很难跟踪到状态发生的改变，不方便针对我们应用程序进行调试；
* 操作真实 DOM 性能较低：传统的开发模式会进行频繁的 DOM 操作，而这一的做法性能非常的低；
