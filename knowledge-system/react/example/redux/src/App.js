import React, { Component } from 'react'
import { connect } from 'react-redux';

class App extends Component {

    render() {
        return (
            <div>
                <div>{this.props.count}</div>
                <div>
                    <button onClick={this.props.countChange}>按钮</button>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        count: state
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        countChange: () => dispatch({
            type: 'ADD'
        })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)