import React, { Component } from 'react'

// 创建 context 对象
const UserContext = React.createContext({
    name: 'hahaha',
    age: 40
})

class A2 extends Component {
    render () {
        const { name, age } = this.context;
        return (
            <div>
                <div>name:{name}</div>
                <div>age:{age}</div>
            </div>
        )
    }
}

A2.contextType = UserContext;

function A1(props) {
    return (
        <A2  />
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
                <UserContext.Provider value={this.state}>
                    <A1  />
                </UserContext.Provider>
            </div>
        )
    }
}
