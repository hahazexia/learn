import React, { Component } from 'react'
import RouterPage from './RouterPage'
import ReactDOM from 'react-dom'

export default class Index extends Component {
    render() {
        return (
            <div>
                <RouterPage />
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'))