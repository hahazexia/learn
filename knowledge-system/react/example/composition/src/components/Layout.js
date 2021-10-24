import React, { Component } from 'react'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
export default class Layout extends Component {
    render() {
        const { children, showTopBar, showBottomBar } = this.props;
        return (
            <div>
                {showTopBar && <TopBar />}
                {children.content}
                <br/>
                {children.txt}
                <button onClick={children.btnClick}>按钮</button>
                {showBottomBar && <BottomBar />}
            </div>
        )
    }
}
