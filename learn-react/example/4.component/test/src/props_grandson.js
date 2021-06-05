import React, { Component } from 'react'

function A2(props) {
    return (
        <div>
            <div>{props.name}</div>
            <div>{props.age}</div>
        </div>
    )
}
function A1(props) {
    return (
        <A2 {...props} />
    )
}

export default class App extends Component {
    constructor () {
        super();
        this.state = {
            name: 'why',
            age: 18
        }
    }
    render() {
        return (
            <div>
                <A1 {...this.state} />
            </div>
        )
    }
}
