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