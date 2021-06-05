import React, { Component } from 'react'

class Button extends Component {
    render () {
        const { increase } = this.props;
        return (
            <button onClick={e => {increase()}}>+1</button>
        )
    }
}

export default class App extends Component {
    constructor (props) {
        super(props);
        this.state = {
            counter: 0
        }
    }
    render() {
        const { counter } = this.state;
        return (
            <div>
                <h2>当前计数：{counter}</h2>
                <button onClick={e => this.increase()}>+</button>
                <Button increase={e => this.increase()} />
            </div>
        )
    }

    increase () {
        this.setState({
            counter: this.state.counter + 1
        })
    }
}
