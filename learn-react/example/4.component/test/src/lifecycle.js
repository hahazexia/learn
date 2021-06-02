import React, { Component } from 'react'

class Ccc extends Component {
    render () {
        return (
            <div>Ccc</div>
        )
    }

    componentWillUnmount () {
        console.log('componentWillUnmount')
    }
}

export default class App extends Component {
    constructor () {
        super();
        console.log('constructor')

        this.state = {
            count: 0,
            show: true
        }
    }

    render() {
        console.log('render')
        return (
            <div>
                App 组件
                {
                    this.state.show && <Ccc />
                }
                <div>{this.state.count}</div>
                <button onClick={() => this.increase()}>+</button>
                <button onClick={() => this.switch()}>切换</button>
            </div>
        )
    }

    switch () {
        this.setState({
            show: !this.state.show
        })
    }

    increase () {
        this.setState({
            count: this.state.count + 1
        })
    }
    
    componentDidMount () {
        console.log('componentDidMount')
    }

    componentDidUpdate () {
        console.log('componentDidUpdate')
    }
}
