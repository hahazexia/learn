import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import store from './store'

class Index extends Component {

    componentDidMount() {
        store.subscribe(() => {
            this.forceUpdate();
        })
    }

    render() {
        return (
            <div>
                <div>{store.getState()}</div>
                <div>
                    <button onClick={() => store.dispatch({type: 'ADD'})}>按钮</button>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'))