import React, { Component } from 'react'
import Slot from './slot'

export default class App extends Component {
    render() {
        return (
            <div>
                <Slot leftSlot={<span>aaaa</span>}
                    centerSlot={<span>bbbb</span>}
                    rightSlot={<a href="/#">点击</a>}
                />
            </div>
        )
    }
}
