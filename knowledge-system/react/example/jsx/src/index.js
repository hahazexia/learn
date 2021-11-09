import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo512.png'
import style from './index.module.scss'
import ClassComponent from './components/ClassComponent';
import FunctionComponent from './components/FunctionComponent';
import SetState from './components/SetState';
import Event from './components/Event';

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
        <ClassComponent />
        <FunctionComponent />
        <SetState />
        <Event />
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