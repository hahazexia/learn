import React, { Component } from 'react'
import ReactDOM from 'react-dom'

export default class Index extends Component {
    constructor(props) {
        console.log('constructor')
        super();
        this.state = {
            count: 0
        }
    }

    static getDerivedStateFromProps(props, state) {
        console.log('getDerivedStateFromProps', props, state)
        return null;
    }

    componentDidMount() {
        console.log('componentDidMount')
    }

    shouldComponentUpdate(props, state) {
        console.log('shouldComponentUpdate')
        return true
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        console.log('getSnapshotBeforeUpdate', prevProps, prevState)
        return null
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdate', prevProps, prevState, snapshot)
    }

    changeCount() {
        this.setState({
            count: this.state.count + 1
        })
    }
    
    render() {
        console.log('render')
        return (
            <div>
                <button onClick={() => this.changeCount()}>改变count</button>
                <br/>
                {this.state.count % 2 && <Count count={this.state.count} />}
            </div>
        )
    }
}

ReactDOM.render(<Index/>, document.getElementById('root'));


class Count extends Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        console.log('componentWillUnmount')
    }

    render() {
        return (
            <div>
                {this.props.count}
            </div>
        )
    }
}

/**
 * 
 *

初始化

constructor()
static getDerivedStateFromProps()
render()
componentDidMount()

更新

static getDerivedStateFromProps()
shouldComponentUpdate()
render()
getSnapshotBeforeUpdate()
componentDidUpdate()

销毁

componentWillUnmount()

 */

