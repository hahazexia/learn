# 组件

## 类组件

```js
import React, { Component } from "react";

export default class ClassComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date()
        }
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                date: new Date()
            })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
    render() {
        const { date } = this.state;
        return (
            <div>
                {date.toLocaleString()}
            </div>
        )
    }
}
```

## 函数组件

```js
import React, { useState, useEffect } from 'react';

export default function FunctionComponent(props) {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    
    return (
        <div>
            <div>FunctionComponent</div>
            <div>{date.toLocaleString()}</div>
        </div>
    )
}

```

## setState

* setState 在合成事件和生命周期中是异步的，其实是批量更新，为了性能优化。把多次 setState 合成一次
* setTimeout 和原生事件中 setState 是同步的
* setState 传递一个函数就可以实现链式调用。如果不用这种形式，那么 setState 多次调用修改同一个值，则只有最后一次起作用，将前面的调用都覆盖掉

```js
import React, { Component } from 'react'

export default class SetState extends Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: 0,
            temp: 0
        };
    }

    componentDidMount() {
        this.changeValue(1);
        document.getElementById('test').addEventListener('click', () => this.changeValue(1))
    }

    // setState 在合成事件和生命周期中是异步的，其实是批量更新，为了性能优化。把多次 setState 合成一次
    changeValue(v) {
        this.setState({
            counter: this.state.counter + v
        }, () => {
            // callback 在 state 更新完成之后执行
            console.log(this.state.counter, 'callback counter')
        });
        console.log(this.state.counter, 'counter');
    }

    // setTimeout 和原生事件 中 setState 是同步的
    setCounter() {
        setTimeout(() => {
            this.changeValue(1);
        });
    }

    // setState 传递一个函数就可以实现链式调用。如果不用这种形式，那么 setState 多次调用修改同一个值，则只有最后一次起作用，将前面的调用都覆盖掉
    linkChangeValue(v) {
        this.setState((state) => {
            return {
                temp: state.temp + v
            }
        })
    }

    setTemp() {
        this.linkChangeValue(1);
        this.linkChangeValue(2);
        this.linkChangeValue(3);
    }

    render() {
        const { counter, temp } = this.state;
        return (
            <div>
                <div>setState</div>
                <button onClick={() => this.setCounter()}>{counter}</button>
                <div id="test">test</div>
                <div onClick={() => this.setTemp()}>{temp}</div>
            </div>
        )
    }
}

```

## props.children

Layout.js

```js
import React, { Component } from 'react'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
export default class Layout extends Component {
    render() {
        const { children, showTopBar, showBottomBar } = this.props;
        return (
            <div>
                {showTopBar && <TopBar />}
                {children.content}
                <br/>
                {children.txt}
                <button onClick={children.btnClick}>按钮</button>
                {showBottomBar && <BottomBar />}
            </div>
        )
    }
}

```

HomePage.js

```js
import React, { Component } from 'react'
import Layout from './Layout'

export default class HomePage extends Component {
    render() {
        return (
            <div>
                <Layout showTopBar={false} showBottomBar={true}>
                    {
                        {
                            content: 'HomePage',
                            txt: '文字',
                            btnClick: () => console.log('点击按钮')
                        }
                    }
                </Layout>
            </div>
        )
    }
}

```
通过例子可以看到，子组件闭合标签中的任意内容都作为 props 的 children 属性传递给了子组件。

## 事件处理函数绑定组件 this 的三种方法

* constructor 中使用 bind 
* 给元素的事件属性传递一个箭头函数，箭头函数中再调用对应的函数
* public class fields 语法

```js
export default class App extends Component {
    constructor(props) {
        super(porps);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {

    }

    handleClick2(p1, event) {

    }

    handleClick3 = () => {}

    handleClick4(p1, event) {

    }

    render() {
        return (
            <div>
                <button onClick={this.handleClick}>按钮1</button>
                <button onClick={(e) => this.handleClick2('666', e)}>按钮2</button>
                <button onClick={this.handleClick3}>按钮3</button>
                <button onClick={this.handleClick4.bind(this, '666')}>按钮4</button>
            </div>
        )
    }
}
```