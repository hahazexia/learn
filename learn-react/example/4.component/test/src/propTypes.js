import React, { Component } from 'react'
import PropTypes from 'prop-types'

function Child (props) {
    const { name, age } = props;
    return (
        <div>
            <div>子组件</div>
            <div>{name + age + 1}</div>
        </div>
    )
}

Child.propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number
}

Child.defaultProps = {
    name: 'why 哈哈'
}

class Child2 extends Component {

    static propTypes = {

    }

    static defaultProps = {

    }
}

export default class App extends Component {
    render() {
        return (
            <div>
                父组件
                <Child age={18} />
            </div>
        )
    }
}
