import React, { Component } from 'react'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'

export default class RouterPage extends Component {
    render() {
        return (
            <div>
                <Router>
                    <Link to="/">首页</Link>
                    <Link to="/user">用户中心</Link>

                    <Switch>
                        <Route exact path="/" component={Home}></Route>
                        <Route path="/user" component={User}></Route>
                        <Route component={Empty}></Route>
                    </Switch>
                </Router>
            </div>
        )
    }
}

class Home extends Component {
    render() {
        return (
            <div>
                首页内容
            </div>
        )
    }
}

class User extends Component {
    render() {
        return (
            <div>
                用户中心内容
            </div>
        )
    }
}

class Empty extends Component {
    render() {
        return (
            <div>
                404
            </div>
        )
    }
}