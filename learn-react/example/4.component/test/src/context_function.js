import React, { Component } from 'react'

// 创建 context 对象
const UserContext = React.createContext({
    name: 'hahaha',
    age: 40
})

function A2() {
    return (
        <UserContext.Consumer>
            {
                value => {
                    return (
                        <div>
                            <div>name:{value.name}</div>
                            <div>age:{value.age}</div>
                        </div>
                    )
                }
            }
        </UserContext.Consumer>
    )
}

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
