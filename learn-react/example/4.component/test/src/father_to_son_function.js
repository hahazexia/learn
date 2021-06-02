import React, { Component } from 'react'

function Child (props) {
    const { name, age } = props;
    return (
        <div>
            <div>子组件</div>
            <div>{name + age + 1}</div>
        </div>
    )
}

export default class App extends Component {
    render() {
        return (
            <div>
                父组件
                <Child name="why" age="18" />
            </div>
        )
    }
}
