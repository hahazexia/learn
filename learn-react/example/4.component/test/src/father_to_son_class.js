import React, { Component } from 'react'

class Child extends Component {
    // constructor (props) {
    //     super()
    //     this.props = props;
    // }

    // constructor (props) {
    //     super(props)
    // }

    render () {
        const { name, age } = this.props;
        return (
            <div>
                <div>子组件</div>
                <div>{name + age}</div>
            </div>
        )
    }
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
